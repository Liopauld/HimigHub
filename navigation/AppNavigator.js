import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { getAuthToken } from '../utils/tokenStorage';
import { setCredentials, logout } from '../redux/slices/authSlice';
import AuthStack from './AuthStack';
import DrawerNavigator from './DrawerNavigator.js';
import AddressSetupScreen from '../screens/User/AddressSetupScreen';
import { View, ActivityIndicator } from 'react-native';
import api from '../redux/api/axiosConfig';
import { useAppTheme } from '../context/ThemeContext';
import usePushNotifications from '../hooks/usePushNotifications';

const isAddressComplete = (address, phone) => {
  const a = address || {};
  return Boolean(a.street?.trim() && a.city?.trim() && a.zip?.trim() && a.country?.trim() && phone?.trim());
};

const AppNavigator = () => {
  const { colors, resolvedMode } = useAppTheme();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = Boolean(token && user);

  usePushNotifications();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await getAuthToken();
        if (token) {
          // Verify token by fetching user profile
          try {
            const response = await api.get('/users/profile');
            dispatch(setCredentials({ user: response.data.data.user, token }));
          } catch (e) {
            dispatch(logout()); // Token invalid
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const requiresAddressSetup = isAuthenticated && !isAddressComplete(user?.address, user?.phone);

  const baseTheme = resolvedMode === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.primaryText,
      border: colors.borderLight,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? (requiresAddressSetup ? <AddressSetupScreen /> : <DrawerNavigator />) : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
