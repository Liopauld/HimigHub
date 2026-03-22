import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import typography from '../../theme/typography';
import { useAppTheme } from '../../context/ThemeContext';

const SearchInput = ({ value, onChangeText, onSearch, placeholder = 'Search...', filterIcon = false, onFilterPress }) => {
  const { colors } = useAppTheme();
  const dynamicStyles = createDynamicStyles(colors);

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, dynamicStyles.searchContainer]}>
        <MaterialCommunityIcons name="magnify" size={24} color={colors.gray[500]} style={styles.icon} />
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearIcon}>
            <MaterialCommunityIcons name="close-circle" size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        )}
      </View>
      {filterIcon && (
        <TouchableOpacity style={[styles.filterButton, dynamicStyles.filterButton]} onPress={onFilterPress}>
          <MaterialCommunityIcons name="tune" size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    height: 50,
  },
  icon: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    height: '100%',
  },
  clearIcon: {
    padding: 12,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  }
});

const createDynamicStyles = (colors) => ({
  searchContainer: {
    backgroundColor: colors.surface,
  },
  input: {
    color: colors.primaryText,
  },
  filterButton: {
    backgroundColor: colors.secondary,
  },
});

export default SearchInput;
