import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { shadows, spacing, radius } from '../../theme/spacing';

/**
 * CartItem — row component for the cart screen.
 * Handles increment, decrement, and delete with improved styling.
 */
const CartItem = ({ item, onIncrement, onDecrement, onDelete }) => {
  const { colors } = useAppTheme();
  const dynamicStyles = createDynamicStyles(colors);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {/* Product Image */}
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/80' }}
        style={[styles.image, dynamicStyles.image]}
        resizeMode="contain"
      />
      
      {/* Details Section */}
      <View style={styles.details}>
        <Text style={[styles.name, dynamicStyles.text]} numberOfLines={2}>{item.name}</Text>
        {item.size && <Text style={[styles.size, dynamicStyles.secondaryText]}>Size: {item.size}</Text>}
        
        <View style={styles.priceRow}>
          <Text style={[styles.price, dynamicStyles.text]}>
            ₱{(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.unitPrice, dynamicStyles.secondaryText]}>
            ₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 1 })} each
          </Text>
        </View>

        {/* Quantity Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.qtyBtn, dynamicStyles.qtySub]} 
            onPress={onDecrement}
            disabled={item.quantity <= 1}
          >
            <Ionicons name="remove" size={14} color={colors.primaryText} />
          </TouchableOpacity>
          <Text style={[styles.qty, dynamicStyles.text]}>{item.quantity}</Text>
          <TouchableOpacity style={[styles.qtyBtn, dynamicStyles.qtyAdd]} onPress={onIncrement}>
            <Ionicons name="add" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Delete Button */}
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Ionicons name="close" size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
    ...shadows.sm,
    borderWidth: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    marginRight: spacing.md,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    fontWeight: '600',
  },
  size: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 11,
    marginTop: spacing.xs,
  },
  priceRow: {
    marginTop: spacing.sm,
  },
  price: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    fontWeight: '700',
  },
  unitPrice: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    marginTop: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  qty: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    minWidth: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  deleteBtn: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
});

const createDynamicStyles = (colors) => ({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  image: {
    backgroundColor: colors.imageCard,
  },
  text: {
    color: colors.primaryText,
  },
  secondaryText: {
    color: colors.secondaryText,
  },
  qtySub: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  qtyAdd: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});

export default CartItem;
