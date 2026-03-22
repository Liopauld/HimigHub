import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

/**
 * SizeChip — a single size selector pill.
 *   selected → #3B6EFF fill, white bold text
 *   unselected → white bg, border #D0D0D0, muted text
 */
const SizeChip = ({ label, selected, onPress }) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors) => StyleSheet.create({
  chip: {
    minWidth: 44,
    height: 44,
    borderRadius: 50, // full pill per spec
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginRight: 8,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.selectedChip,
  },
  label: { fontSize: 14 },
  labelUnselected: { fontFamily: 'DMSans_400Regular', color: colors.secondaryText },
  labelSelected: { fontFamily: 'DMSans_700Bold', color: colors.surface },
});

export default SizeChip;
