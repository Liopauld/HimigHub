import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { darkColors, lightColors } from '../theme/colors';

const THEME_MODE_KEY = 'mobileessence_theme_mode';

const ThemeContext = createContext({
  mode: 'system',
  resolvedMode: 'light',
  colors: lightColors,
  setMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState('system');

  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
          setModeState(savedMode);
        }
      } catch (error) {
        console.warn('Failed to load theme mode:', error?.message || error);
      }
    };

    loadMode();
  }, []);

  const setMode = async (nextMode) => {
    if (!['light', 'dark', 'system'].includes(nextMode)) return;
    setModeState(nextMode);

    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, nextMode);
    } catch (error) {
      console.warn('Failed to save theme mode:', error?.message || error);
    }
  };

  const resolvedMode = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const colors = resolvedMode === 'dark' ? darkColors : lightColors;

  const value = useMemo(
    () => ({ mode, resolvedMode, colors, setMode }),
    [mode, resolvedMode, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => useContext(ThemeContext);
