import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

const DiscountBadge = ({ percent, style }) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (!percent || percent <= 0) return null;

  return (
    <View style={[styles.badge, style]}>
      <Text style={styles.label}>-{Math.round(percent)}%</Text>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  badge: {
    backgroundColor: colors.discountBadge,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#FFFFFF', // Discount badge is always red, white text is best
  },
});

export default DiscountBadge;
