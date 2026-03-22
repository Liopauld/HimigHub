import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Text from '../typography/Text';
import Button from '../buttons/Button';
import Input from '../inputs/Input';
import { useAppTheme } from '../../context/ThemeContext';

const FilterModal = ({ visible, onClose, currentFilters, onApply }) => {
  const { colors } = useAppTheme();
  const [localFilters, setLocalFilters] = useState({
    category: currentFilters?.category || '',
    minPrice: currentFilters?.minPrice || '',
    maxPrice: currentFilters?.maxPrice || '',
  });

  const categories = ['Wind', 'String', 'Percussion'];

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const cleared = { category: '', minPrice: '', maxPrice: '' };
    setLocalFilters(cleared);
    onApply(cleared);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text variant="h3" weight="bold">Filters</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.imageCard }] }>
              <MaterialCommunityIcons name="close" size={24} color={colors.primaryText} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>Category</Text>
            <View style={styles.chipContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip, 
                    { backgroundColor: colors.imageCard },
                    localFilters.category === cat && [styles.chipActive, { backgroundColor: colors.primary }]
                  ]}
                  onPress={() => setLocalFilters(prev => ({ ...prev, category: prev.category === cat ? '' : cat }))}
                >
                  <Text 
                    variant="bodySmall" 
                    weight={localFilters.category === cat ? "semiBold" : "regular"}
                    color={localFilters.category === cat ? 'light' : 'primaryText'}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceInput}>
                <Input
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChangeText={(val) => setLocalFilters(prev => ({ ...prev, minPrice: val }))}
                  keyboardType="numeric"
                />
              </View>
              <Text style={[styles.priceDivider, { color: colors.secondaryText }]} color="primaryText">-</Text>
              <View style={styles.priceInput}>
                <Input
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChangeText={(val) => setLocalFilters(prev => ({ ...prev, maxPrice: val }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
            <Button
              title="Clear All"
              variant="outline"
              style={styles.footerButton}
              onPress={handleClear}
            />
            <View style={{ width: 16 }} />
            <Button
              title="Apply Filters"
              style={styles.footerButton}
              onPress={handleApply}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '80%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20, // Strict BR requirement
  },
  scrollContent: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 16,
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20, // Min BR 20
    marginRight: 12,
    marginBottom: 12,
  },
  chipActive: {},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInput: {
    flex: 1,
  },
  priceDivider: {
    marginHorizontal: 16,
    fontSize: 24,
  },
  footer: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
  },
});

export default FilterModal;
