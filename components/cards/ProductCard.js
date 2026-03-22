import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../typography/Text';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BASE_URL } from '../../redux/api/axiosConfig';

const ProductCard = ({ product, onPress, style }) => {
  const { colors } = useAppTheme();
  
  const imageUrl = product.images?.length > 0 
    ? (product.images[0].startsWith('http') ? product.images[0] : `${BASE_URL.replace('/api', '')}${product.images[0]}`)
    : 'https://via.placeholder.com/150';

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: colors.surface, shadowColor: colors.shadowDefault },
        style
      ]} 
      onPress={onPress} 
      activeOpacity={0.9}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.imageCard }]}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        {product.discount > 0 && (
          <View style={[styles.discountBadge, { backgroundColor: colors.discountBadge }]}>
            <Text variant="caption" weight="bold" color="light">-{product.discount}%</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text variant="bodySmall" color="secondary" numberOfLines={1}>{product.brand}</Text>
        <Text variant="body" weight="semiBold" numberOfLines={2} style={styles.name}>{product.name}</Text>
        
        <View style={styles.ratingRow}>
          <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
          <Text variant="bodySmall" weight="semiBold" style={styles.ratingText}>{product.ratings.toFixed(1)}</Text>
          <Text variant="caption" color="secondary">({product.numOfReviews})</Text>
        </View>

        <View style={styles.priceRow}>
          <Text variant="h4" weight="bold" color="primary">{formatCurrency(product.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24, // > 20 requirements
    overflow: 'hidden',
    width: '100%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  content: {
    padding: 16,
  },
  name: {
    marginTop: 4,
    marginBottom: 8,
    height: 48, // ensure multiline alignment
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    marginRight: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default ProductCard;
