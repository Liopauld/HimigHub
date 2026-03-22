import React from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../typography/Text';

const SearchAutocompleteInput = ({
  value,
  onChangeText,
  onSearch,
  suggestions = [],
  onSelectSuggestion,
  placeholder = 'Search...',
  colors,
}) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleSuggestionPress = (suggestion) => {
    onSelectSuggestion?.(suggestion);
    setShowSuggestions(false);
    onSearch?.();
  };

  const handleClear = () => {
    onChangeText?.('');
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Ionicons name="search" size={18} color={colors.secondaryText} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: colors.primaryText }]}
          placeholder={placeholder}
          placeholderTextColor={colors.secondaryText}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => value && onChangeText && setShowSuggestions(true)}
          returnKeyType="search"
          onSubmitEditing={onSearch}
        />
        {value && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={colors.secondaryText} />
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={[styles.suggestionsBox, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => `${item}-${index}`}
            scrollEnabled={suggestions.length > 5}
            nestedScrollEnabled
            renderItem={({ item: suggestion }) => (
              <TouchableOpacity
                onPress={() => handleSuggestionPress(suggestion)}
                style={[styles.suggestionItem, { borderBottomColor: colors.borderLight }]}
              >
                <Ionicons name="search-outline" size={16} color={colors.secondaryText} style={styles.suggestionIcon} />
                <Text variant="body" color="primary" numberOfLines={1}>{suggestion}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  icon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  suggestionsBox: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  suggestionIcon: {
    marginRight: 8,
  },
});

export default SearchAutocompleteInput;
