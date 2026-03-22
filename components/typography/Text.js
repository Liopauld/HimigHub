import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import typography from '../../theme/typography';
import { useAppTheme } from '../../context/ThemeContext';

const Text = ({ children, style, variant = 'body', weight = 'regular', color = 'text', align = 'left', ...props }) => {
  const { colors } = useAppTheme();
  const getVariantStyle = () => {
    switch (variant) {
      case 'h1': return styles.h1;
      case 'h2': return styles.h2;
      case 'h3': return styles.h3;
      case 'h4': return styles.h4;
      case 'body': return styles.body;
      case 'bodySmall': return styles.bodySmall;
      case 'caption': return styles.caption;
      default: return styles.body;
    }
  };

  const getWeightStyle = () => {
    switch (weight) {
      case 'bold': return { fontFamily: typography.fonts.bold };
      case 'semiBold': return { fontFamily: typography.fonts.semiBold };
      case 'medium': return { fontFamily: typography.fonts.medium };
      case 'regular': return { fontFamily: typography.fonts.regular };
      default: return { fontFamily: typography.fonts.regular };
    }
  };

  const getColorStyle = () => {
    switch (color) {
      case 'text': return { color: colors.primaryText };
      case 'secondary': return { color: colors.secondaryText };
      case 'primary': return { color: colors.primary };
      case 'light': return { color: colors.white };
      case 'error': return { color: colors.error };
      case 'success': return { color: colors.success };
    }
    
    if (typeof color === 'string' && colors[color]) {
      return { color: colors[color] };
    }

    return { color }; // Allow passing raw color string
  };

  return (
    <RNText 
      style={[
        getVariantStyle(),
        getColorStyle(),
        getWeightStyle(),
        { textAlign: align },
        style
      ]} 
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: typography.sizes.xxxl, letterSpacing: -0.5 },
  h2: { fontSize: typography.sizes.xxl, letterSpacing: -0.5 },
  h3: { fontSize: typography.sizes.xl },
  h4: { fontSize: typography.sizes.lg },
  body: { fontSize: typography.sizes.md, lineHeight: 24 },
  bodySmall: { fontSize: typography.sizes.sm, lineHeight: 20 },
  caption: { fontSize: typography.sizes.xs },
});

export default Text;
