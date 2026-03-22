import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { shadows, spacing, radius } from '../../theme/spacing';

/**
 * AppButton — enhanced with multiple variants:
 *   primary  → lime green (#AAEE44) — main CTAs
 *   dark     → near-black (#1A1A1A) — secondary actions
 *   outline  → transparent with border — tertiary actions
 *   success  → green — positive actions
 *   error    → red — destructive actions
 *   ghost    → minimal styling — link-like buttons
 */
const AppButton = ({
  title,
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconSize,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { colors } = useAppTheme();
  
  const buttonText = title || label;

  const getBackgroundColor = () => {
    if (variant === 'primary') return colors.accent;
    if (variant === 'dark') return colors.arButton;
    if (variant === 'success') return colors.success;
    if (variant === 'error') return colors.error;
    if (variant === 'outline') return 'transparent';
    if (variant === 'ghost') return 'transparent';
    return colors.accent;
  };

  const getTextColor = () => {
    if (variant === 'primary') return colors.primaryText;
    if (variant === 'dark') return colors.surface;
    if (variant === 'outline') return colors.primaryText;
    if (variant === 'ghost') return colors.primaryText;
    return colors.surface;
  };

  const getBorderStyle = () => {
    if (variant === 'outline') return { borderWidth: 1.5, borderColor: colors.borderLight };
    if (variant === 'ghost') return { borderWidth: 0 };
    return {};
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return { height: 40, paddingHorizontal: spacing.md };
      case 'lg':
        return { height: 56, paddingHorizontal: spacing.xl };
      case 'md':
      default:
        return { height: 48, paddingHorizontal: spacing.lg };
    }
  };

  const getIconSize = () => {
    if (iconSize) return iconSize;
    return size === 'sm' ? 16 : size === 'lg' ? 20 : 18;
  };

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        getSize(),
        {
          backgroundColor: getBackgroundColor(),
          width: fullWidth ? '100%' : 'auto',
        },
        getBorderStyle(),
        variant !== 'ghost' && variant !== 'outline' && shadows.sm,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={[styles.row, iconPosition === 'right' && styles.rowReverse]}>
          {icon && (
            <Ionicons
              name={icon}
              size={getIconSize()}
              color={getTextColor()}
              style={[styles.icon, iconPosition === 'right' && { marginLeft: spacing.xs, marginRight: 0 }]}
            />
          )}
          <Text style={[styles.label, { color: getTextColor() }, textStyle]}>{buttonText}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default AppButton;
