import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';

const Screen = ({ children, style }) => {
  const { colors, resolvedMode } = useAppTheme();
  const isIos = Platform.OS === 'ios';

  if (isIos) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, style]}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: StatusBar.currentHeight, backgroundColor: colors.background }, style]}>
      <StatusBar
        barStyle={resolvedMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default Screen;
