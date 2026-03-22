import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../../redux/slices/productSlice';
import { addItem } from '../../redux/slices/cartSlice';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import Button from '../../components/buttons/Button';
import IconButton from '../../components/buttons/IconButton';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { BASE_URL } from '../../redux/api/axiosConfig';

const { width } = Dimensions.get('window');

const ProductDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { product, loading } = useSelector(state => state.product);
  const [quantity, setQuantity] = useState(1);
  const { colors } = useAppTheme();

  const handleGoBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0] || '',
      stock: product.stock,
      size: null, // Depending on if physical sizes are needed
    }));
    // Could show a toast or feedback
  };

  if (loading || !product) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  const imageUrl = product.images?.length > 0 
    ? (product.images[0].startsWith('http') ? product.images[0] : `${BASE_URL.replace('/api', '')}${product.images[0]}`)
    : 'https://via.placeholder.com/400';

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <IconButton 
          icon="arrow-left" 
          onPress={handleGoBack} 
          backgroundColor={colors.imageCard}
          color={colors.primaryText}
        />
        <IconButton 
          icon="cart-outline" 
          onPress={() => navigation.navigate('Cart')} 
          backgroundColor={colors.imageCard}
          color={colors.primaryText}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        </View>

        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.brandRow}>
            <Text variant="bodySmall" weight="bold" color="secondary" style={styles.brand}>{product.brand?.toUpperCase()}</Text>
            <View style={[styles.ratingBadge, { backgroundColor: colors.imageCard }]}>
              <Text variant="bodySmall" weight="bold" color="primaryText">★ {product.ratings.toFixed(1)}</Text>
            </View>
          </View>

          <Text variant="h2" weight="bold" style={styles.name} color="primaryText">{product.name}</Text>
          <Text variant="h3" weight="bold" color="primary" style={styles.price}>{formatCurrency(product.price)}</Text>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <Text variant="h4" weight="semiBold" style={styles.sectionTitle} color="primaryText">Description</Text>
          <Text variant="body" color="secondary" style={styles.description}>
            {product.description}
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.quantityContainer}>
            <Text variant="h4" weight="semiBold" color="primaryText">Quantity</Text>
            <View style={styles.quantityControls}>
              <IconButton 
                icon="minus" 
                size={20}
                backgroundColor={colors.imageCard}
                color={colors.primaryText}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              />
              <Text variant="body" weight="bold" style={styles.qtyText} color="primaryText">{quantity}</Text>
              <IconButton 
                icon="plus" 
                size={20}
                backgroundColor={colors.imageCard}
                color={colors.primaryText}
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
        <Button 
          title={product.stock > 0 ? "Add to Cart" : "Out of Stock"}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
          icon="cart-plus"
          style={styles.addToCartBtn}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 10,
  },
  scroll: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  content: {
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
    letterSpacing: 1,
  },
  ratingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  name: {
    marginBottom: 12,
  },
  price: {
    marginBottom: 24,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  description: {
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyText: {
    marginHorizontal: 16,
    width: 24,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  addToCartBtn: {
    width: '100%',
  }
});

export default ProductDetailsScreen;
