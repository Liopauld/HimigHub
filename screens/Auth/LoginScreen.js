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

const IS_EXPO_GO =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

let GoogleSignin = null;
if (!IS_EXPO_GO) {
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
    GoogleSignin.configure({
      webClientId:
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
        process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    });
  } catch (e) {
    console.log('[GoogleAuth] native-google-signin-unavailable:', e?.message || String(e));
  }
}

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { colors } = useAppTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [googlePending, setGooglePending] = useState(false);
  const isExpoGo = IS_EXPO_GO;
  const projectNameForProxy = '@pauldom/himighub';
  const proxyClientId =
    process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const proxyRedirectUri = `https://auth.expo.io/${projectNameForProxy}`;

  const googleAuthConfig = {
    ...(isExpoGo
      ? {
          expoClientId: proxyClientId,
          webClientId: proxyClientId,
          androidClientId: proxyClientId,
          iosClientId: proxyClientId,
          // Keep Expo Go config minimal so AuthSession can manage proxy redirect/state.
          responseType: AuthSession.ResponseType.Token,
        }
      : {
          expoClientId: proxyClientId,
          webClientId: proxyClientId,
          androidClientId: proxyClientId,
          iosClientId: proxyClientId,
          redirectUri: proxyRedirectUri,
          responseType: AuthSession.ResponseType.IdToken,
          usePKCE: false,
        }),
    scopes: ['openid', 'profile', 'email'],
    extraParams: {
      prompt: 'select_account',
    },
  };

  const [request, response, promptAsync] = Google.useAuthRequest(
    googleAuthConfig,
    {
      useProxy: true,
      projectNameForProxy,
    }
  );

  useEffect(() => {
    if (!request?.url) return;
    // Debug aid for OAuth mismatches: confirms exact client_id + redirect_uri sent to Google.
    console.log('[GoogleAuth] mode:', isExpoGo ? 'expo-go-disabled' : 'standalone-native');
    console.log('[GoogleAuth] requestUrl:', request.url);
    console.log('[GoogleAuth] redirectUri:', request?.redirectUri || '(auto)');
    console.log('[GoogleAuth] clientId:', isExpoGo ? proxyClientId : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);
  }, [request?.url, request?.redirectUri, proxyClientId, isExpoGo]);
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
      throw new Error(`Firebase exchange failed (${response.status}): ${message}`);
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

  const extractTokensFromAuthResult = (authResult) => {
    const callbackHash = authResult?.url?.includes('#')
      ? authResult.url.split('#')[1]
      : '';
    const hashParams = new URLSearchParams(callbackHash);

    const idToken =
      authResult?.authentication?.idToken ||
      authResult?.params?.id_token ||
      hashParams.get('id_token');

    const accessToken =
      authResult?.authentication?.accessToken ||
      authResult?.params?.access_token ||
      hashParams.get('access_token');

    const authCode =
      authResult?.params?.code ||
      hashParams.get('code');

    const providerMessage =
      authResult?.params?.error_description ||
      authResult?.params?.error ||
      hashParams.get('error_description') ||
      hashParams.get('error');

    return { idToken, accessToken, providerMessage };
  };

  useEffect(() => {
    if (!response) return;

    const processGoogleResponse = async () => {
      console.log('[GoogleAuth] step:', 'response-channel', response?.type);
      if (response?.type === 'dismiss') {
        console.log('[GoogleAuth] dismiss-response-details:', {
          hasUrl: Boolean(response?.url),
          hasParams: Boolean(response?.params),
        });
      }

      let { idToken, accessToken, providerMessage } = extractTokensFromAuthResult(response);

      console.log('[GoogleAuth] step:', 'token-parse', {
        hasIdToken: Boolean(idToken),
        hasAccessToken: Boolean(accessToken),
      });

      if (response.type !== 'success' && !idToken && !accessToken) {
        if (googlePending) {
          const failureReason = response.type || 'unknown';
          setErrors({ google: providerMessage || `Google login did not complete (${failureReason}).` });
        }
        setGooglePending(false);
        return;
      }

      if (!idToken && !accessToken) {
        setErrors({ google: 'Google login failed. Missing token from Google response.' });
        setGooglePending(false);
        return;
      }

      try {
        const firebaseToken = await exchangeGoogleForFirebaseToken({
          googleIdToken: idToken,
          googleAccessToken: accessToken,
        });
        console.log('[GoogleAuth] step:', 'firebase-exchange-success');

        await dispatch(googleLogin(firebaseToken)).unwrap();
        console.log('[GoogleAuth] step:', 'backend-login-success');
      } catch (e) {
        console.log('[GoogleAuth] step:', 'login-failed', e?.message || String(e));
        setErrors({ google: e?.message || String(e) || 'Google login failed. Please try again.' });
      } finally {
        setGooglePending(false);
      }
    };

    processGoogleResponse();
  }, [response]);

  const handleGoogleLogin = async () => {
    setErrors({});
    try {
      console.log('[GoogleAuth] step:', 'start-google-login');
      if (isExpoGo) {
        setErrors({
          google:
            'Google Sign-In is disabled in Expo Go because redirect_uri uses exp:// and Google blocks it. Install the preview APK (EAS build) to use Google login.',
        });
        return;
      }

      // Preferred path in standalone builds: native Google Sign-In (no browser redirect flow).
      if (GoogleSignin) {
        console.log('[GoogleAuth] mode:', 'native-google-signin');
        try {
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          try {
            await GoogleSignin.signOut();
          } catch {
            // ignore signOut failures; account picker can still open
          }

          const signInResult = await GoogleSignin.signIn();
          let googleIdToken = signInResult?.data?.idToken || signInResult?.idToken;

          if (!googleIdToken && GoogleSignin.getTokens) {
            const tokens = await GoogleSignin.getTokens();
            googleIdToken = tokens?.idToken;
          }

          if (!googleIdToken) {
            throw new Error('Native Google Sign-In returned no idToken.');
          }

          const firebaseToken = await exchangeGoogleForFirebaseToken({
            googleIdToken,
            googleAccessToken: null,
          });
          console.log('[GoogleAuth] step:', 'firebase-exchange-success');

          await dispatch(googleLogin(firebaseToken)).unwrap();
          console.log('[GoogleAuth] step:', 'backend-login-success');
          return;
        } catch (nativeError) {
          console.log('[GoogleAuth] native-google-signin-failed:', nativeError?.message || String(nativeError));
          // Fall through to auth-session flow below when native signin fails.
        }
      }

      if (!hasFirebaseConfig || !firebaseApiKey) {
        setErrors({ google: 'Google login is not configured yet. Add Firebase env keys in frontend/.env.' });
        return;
      }

      if (!request) {
        setErrors({ google: 'Google login request is still loading. Please try again.' });
        return;
      }

      setGooglePending(true);


      const promptOptions = {
        useProxy: true,
        projectNameForProxy,
        showInRecents: true,
      };

      const authResult = await promptAsync(promptOptions);
      console.log('[GoogleAuth] step:', 'auth-result-received', authResult?.type);
      if (authResult?.type === 'dismiss') {
        console.log('[GoogleAuth] dismiss-details:', {
          hasUrl: Boolean(authResult?.url),
          hasParams: Boolean(authResult?.params),
        });
      }
    } catch (e) {
      console.log('[GoogleAuth] step:', 'login-failed', e?.message || String(e));
      setGooglePending(false);
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
            disabled={!request || isExpoGo}
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
