import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform, Image, Alert } from 'react-native';
import Constants from 'expo-constants';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleLogin } from '../../redux/slices/authSlice';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import Input from '../../components/inputs/Input';
import Button from '../../components/buttons/Button';
import { spacing, shadows, radius } from '../../theme/spacing';
import { firebaseApiKey, firebaseConfig, hasFirebaseConfig } from '../../firebase/config';
import { useAppTheme } from '../../context/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { colors } = useAppTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const isExpoGo =
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === 'storeClient';
  const expoOwner = Constants?.expoConfig?.owner || 'liopauld';
  const expoSlug = Constants?.expoConfig?.slug || 'himighub';
  const projectNameForProxy = `@${expoOwner}/${expoSlug}`;
  const redirectUri = `https://auth.expo.io/${projectNameForProxy}`;

  // Force proxy web OAuth flow to guarantee redirect URI matches auth.expo.io.
  const googleAuthConfig = {
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
    usePKCE: false,
  };

  const [request, , promptAsync] = Google.useAuthRequest(
    googleAuthConfig,
    {
      useProxy: true,
      projectNameForProxy,
    }
  );

  useEffect(() => {
    if (!request?.url) return;
    // Debug aid for OAuth mismatches: confirms exact client_id + redirect_uri sent to Google.
    console.log('[GoogleAuth] configVersion: proxy-idtoken-v2');
    console.log('[GoogleAuth] requestUrl:', request.url);
    console.log('[GoogleAuth] redirectUri:', redirectUri);
  }, [request?.url]);
  const exchangeGoogleForFirebaseToken = async ({ googleIdToken, googleAccessToken }) => {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${firebaseApiKey}`;
    const authHandlerUrl = firebaseConfig?.authDomain
      ? `https://${firebaseConfig.authDomain}/__/auth/handler`
      : 'http://localhost';
    const postBody = googleIdToken
      ? `id_token=${encodeURIComponent(googleIdToken)}&providerId=google.com`
      : `access_token=${encodeURIComponent(googleAccessToken)}&providerId=google.com`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postBody,
        requestUri: authHandlerUrl,
        returnSecureToken: true,
        returnIdpCredential: true,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      const rawMessage = payload?.error?.message || 'Firebase token exchange failed.';
      const message = rawMessage === 'CONFIGURATION_NOT_FOUND'
        ? 'Firebase Google Sign-In is not enabled. In Firebase Console, enable Authentication > Sign-in method > Google and save.'
        : rawMessage;
      throw new Error(message);
    }

    if (!payload?.idToken) {
      throw new Error('Firebase token exchange succeeded but no idToken was returned.');
    }

    return payload.idToken;
  };

  const handleLogin = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    dispatch(login({ email, password }));
  };

  const handleGoogleLogin = async () => {
    setErrors({});
    try {
      if (!hasFirebaseConfig || !firebaseApiKey) {
        setErrors({ google: 'Google login is not configured yet. Add Firebase env keys in frontend/.env.' });
        return;
      }

      if (!request) {
        setErrors({ google: 'Google login request is still loading. Please try again.' });
        return;
      }

      if (__DEV__ && request.url) {
        const hasExpectedRedirect = request.url.includes(encodeURIComponent(redirectUri));
        if (!hasExpectedRedirect) {
          console.warn('[GoogleAuth] Unexpected redirect URI in request URL', { redirectUri, requestUrl: request.url });
        }
      }

      const authResult = await promptAsync({
        useProxy: true,
        projectNameForProxy,
        showInRecents: true,
      });

      if (authResult.type !== 'success') {
        return;
      }

      let idToken =
        authResult.authentication?.idToken ||
        authResult.params?.id_token;

      const accessToken =
        authResult.authentication?.accessToken ||
        authResult.params?.access_token;

      if (!idToken && !accessToken) {
        setErrors({ google: 'Google login failed. Missing token from Google response.' });
        return;
      }

      const firebaseToken = await exchangeGoogleForFirebaseToken({
        googleIdToken: idToken,
        googleAccessToken: accessToken,
      });

      await dispatch(googleLogin(firebaseToken)).unwrap();
    } catch (e) {
      setErrors({ google: e?.message || String(e) || 'Google login failed. Please try again.' });
    }
  };

  return (
    <Screen style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={{ width: 80, height: 80, marginBottom: spacing.md, borderRadius: 16 }} 
            resizeMode="cover" 
          />
          <Text variant="h2" weight="bold" color="primary" style={styles.title}>HIMIGHUB</Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            Welcome back! Login to continue shopping.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <Input
            label="Email Address"
            placeholder="your@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({...errors, email: ''});
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
          />

          {/* Password Input */}
          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({...errors, password: ''});
            }}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          {/* Error Message */}
          {(error || errors.google) && (
            <View style={[styles.errorBox, { backgroundColor: colors.errorLight, borderLeftColor: colors.error }]}>
              <Text color="error" style={styles.errorText}>
                {errors.google || error.message || error}
              </Text>
            </View>
          )}

          {/* Forgot Password */}
          <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('Register')}>
            <Text variant="bodySmall" weight="semiBold" color="primary">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button 
            title="Log In" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.loginBtn}
            fullWidth
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            <Text variant="bodySmall" color="secondary" style={styles.dividerText}>OR</Text>
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          </View>

          {/* Social Login */}
          <Button 
            title="Continue with Google" 
            variant="outline"
            icon="logo-google"
            iconFamily="ionicons"
            iconPosition="left"
            onPress={handleGoogleLogin}
            disabled={!request}
            style={styles.socialBtn}
            fullWidth
          />

          {/* Sign Up Link */}
          <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
            <Text variant="body" color="secondary">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text variant="body" weight="bold" color="primary">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxxl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  title: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  errorBox: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
  },
  loginBtn: {
    marginBottom: spacing.xl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontWeight: '500',
  },
  socialBtn: {
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xxxl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  }
});

export default LoginScreen;
