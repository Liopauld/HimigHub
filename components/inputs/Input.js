import React from 'react';
import { TextInput, View, StyleSheet, TouchableOpacity } from 'react-native';
import typography from '../../theme/typography';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Text from '../typography/Text';
import { useAppTheme } from '../../context/ThemeContext';

const Input = ({ label, value, onChangeText, secureTextEntry, placeholder, error, rightIcon, onRightIconPress, keyboardType, ...props }) => {
  const { colors } = useAppTheme();
  const dynamicStyles = createDynamicStyles(colors);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, dynamicStyles.label]}>{label}</Text>}
      <View style={[styles.inputContainer, dynamicStyles.inputContainer, error && dynamicStyles.errorInput]}>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          keyboardType={keyboardType}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.icon}>
            <MaterialCommunityIcons name={rightIcon} size={24} color={colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[styles.errorText, dynamicStyles.errorText]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontFamily: typography.fonts.semiBold,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
  },
  icon: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fonts.regular,
    marginTop: 4,
    marginLeft: 4,
  },
});

const createDynamicStyles = (colors) => ({
  label: {
    color: colors.primaryText,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  input: {
    color: colors.primaryText,
  },
  errorInput: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
  },
});

export default Input;
