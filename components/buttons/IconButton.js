import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

const IconButton = ({
  icon,
  onPress,
  size = 24,
  color,
  backgroundColor = 'transparent',
  style,
  disabled = false,
}) => {
  const { colors } = useAppTheme();
  
  // Use provided color or default to primaryText
  const iconColor = color || colors.primaryText;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name={icon} size={size} color={disabled ? colors.secondaryText : iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20, // Strict design system requirement
  },
  disabled: {
    opacity: 0.5,
  }
});

export default IconButton;
