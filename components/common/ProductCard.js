import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { addItem } from '../../redux/slices/cartSlice';
import { insertCartItem } from '../../db/sqlite';
import DiscountBadge from './DiscountBadge';
import { shadows, spacing, radius } from '../../theme/spacing';
import { BASE_URL } from '../../redux/api/axiosConfig';
import { useAppTheme } from '../../context/ThemeContext';

const ProductCard = ({ product, onPress }) => {
  const dispatch = useDispatch();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const imageUrl =
    product.images?.length > 0
      ? product.images[0].startsWith('http')
        ? product.images[0]
        : `${BASE_URL.replace('/api', '')}${product.images[0]}`
      : 'https://via.placeholder.com/200';

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const cartItem = {
      productId: product._id,
      name: product.name,
      image: imageUrl,
      price: product.price,
      quantity: 1,
      size: null,
    };
    dispatch(addItem(cartItem));
    await insertCartItem(cartItem);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Image area */}
      <View style={styles.imageArea}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        {product.discountPercent > 0 && (
          <DiscountBadge
            percent={product.discountPercent}
            style={styles.discountBadge}
          />
        )}
        {/* Wishlist button */}
        <TouchableOpacity style={styles.wishlistBtn}>
          <Ionicons name="heart-outline" size={18} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.brand} numberOfLines={1}>{product.brand || 'Brand'}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        {/* Rating */}
        {product.numReviews > 0 && (
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.round(product.ratings) ? 'star' : 'star-outline'}
                  size={12}
                  color={colors.accent}
                />
              ))}
            </View>
            <Text style={styles.reviewCount}>({product.numReviews})</Text>
          </View>
        )}
        
        <View style={styles.footer}>
          <View>
            <Text style={styles.price}>
              ₱{product.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>
                ₱{product.originalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.plusBtn} onPress={handleAddToCart}>
            <Ionicons name="add" size={16} color={colors.primaryText} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors) => StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    margin: spacing.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  imageArea: {
    backgroundColor: colors.imageCard,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  image: {
    width: '75%',
    height: '80%',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  wishlistBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  info: {
    padding: spacing.md,
  },
  brand: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 11,
    color: colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: 'Syne_700Bold',
    fontSize: 13,
    color: colors.primaryText,
    marginTop: spacing.xs,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: colors.secondaryText,
    marginLeft: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing.md,
  },
  price: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: colors.primaryText,
    fontWeight: '700',
  },
  originalPrice: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.strikethrough,
    textDecorationLine: 'line-through',
    marginTop: spacing.xs,
  },
  plusBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});

export default ProductCard;
