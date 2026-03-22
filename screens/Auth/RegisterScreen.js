import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../redux/slices/authSlice';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import Input from '../../components/inputs/Input';
import Button from '../../components/buttons/Button';
import colors from '../../theme/colors';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleRegister = () => {
    setValidationError('');
    if (!name || !email || !password || !confirmPassword) {
      setValidationError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }
    dispatch(register({ name, email, password }));
  };

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/logo.png')} 
            style={{ width: 80, height: 80, marginBottom: 16, borderRadius: 16 }} 
            resizeMode="cover" 
          />
          <Text variant="h1" weight="bold" color="primary">Create Account</Text>
          <Text variant="body" color="secondary" style={styles.subtitle}>
            Sign up to get started!
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />
          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />

          {(error || validationError) ? (
            <Text color="error" style={styles.error}>
              {validationError || error?.message || error}
            </Text>
          ) : null}

          <Button 
            title="Sign Up" 
            onPress={handleRegister} 
            loading={loading}
            style={styles.registerBtn}
          />

          <View style={styles.footer}>
            <Text variant="body" color="secondary">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text variant="body" weight="bold" color="primary">Log In</Text>
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
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  registerBtn: {
    marginTop: 16,
    marginBottom: 24,
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  }
});

export default RegisterScreen;
