import React from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet, View } from 'react-native';
import Text from '../typography/Text';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'large', // large, medium, small
  disabled = false,
  loading = false,
  icon,
  iconFamily = 'material-community',
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const { colors } = useAppTheme();

  const getContainerStyle = () => {
    const dynamicStyles = createDynamicStyles(colors);
    let style = [styles.container];
    
    // Size
    if (size === 'large') style.push(styles.sizeLarge);
    else if (size === 'medium') style.push(styles.sizeMedium);
    else if (size === 'small') style.push(styles.sizeSmall);

    // Variant
    if (variant === 'primary') style.push(dynamicStyles.primary);
    else if (variant === 'secondary') style.push(dynamicStyles.secondary);
    else if (variant === 'outline') style.push(dynamicStyles.outline);
    else if (variant === 'ghost') style.push(dynamicStyles.ghost);

    if (disabled) style.push(dynamicStyles.disabled);

    return style;
  };

  const getTextColor = () => {
    if (disabled) return colors.gray[400];
    if (variant === 'primary') return colors.white;
    if (variant === 'secondary') return colors.primary;
    if (variant === 'outline' || variant === 'ghost') return colors.primary;
    return colors.white;
  };

  const renderIcon = () => {
    if (!icon) return null;
    const IconComponent = iconFamily === 'ionicons' ? Ionicons : MaterialCommunityIcons;

    return (
      <IconComponent
        name={icon} 
        size={size === 'small' ? 16 : 20} 
        color={getTextColor()} 
        style={[
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
          title ? {} : { marginHorizontal: 0 } // center icon if no text
        ]}
      />
    );
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {iconPosition === 'left' && renderIcon()}
          {title && (
            <Text 
              variant={size === 'small' ? 'bodySmall' : 'body'}
              weight="semiBold"
              style={[{ color: getTextColor() }, textStyle]}
            >
              {title}
            </Text>
          )}
          {iconPosition === 'right' && renderIcon()}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20, // Min border radius
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Sizes
  sizeLarge: { height: 56, paddingHorizontal: 32 },
  sizeMedium: { height: 48, paddingHorizontal: 24 },
  sizeSmall: { height: 36, paddingHorizontal: 16 },
  // Icons
  iconLeft: { marginRight: 8 },
  iconRight: { marginLeft: 8 },
});

const createDynamicStyles = (colors) => ({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.secondary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  ghost: { backgroundColor: 'transparent' },
  disabled: {
    backgroundColor: colors.gray[200],
    borderColor: colors.gray[200],
  },
});

export default Button;
