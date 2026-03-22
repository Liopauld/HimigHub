import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../../redux/slices/productSlice';
import { fetchProductReviews } from '../../redux/slices/reviewSlice';
import { addItem } from '../../redux/slices/cartSlice';
import { insertCartItem } from '../../db/sqlite';
import SizeChip from '../../components/common/SizeChip';
import RatingStars from '../../components/common/RatingStars';
import ReviewCard from '../../components/common/ReviewCard';
import DiscountBadge from '../../components/common/DiscountBadge';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import AppButton from '../../components/common/AppButton';
import { useAppTheme } from '../../context/ThemeContext';
import { BASE_URL } from '../../redux/api/axiosConfig';

const { width: SCREEN_W } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 340;

// Variant-based price adjustment for display when backend stores one base price.
const getSizePriceAdjustment = (sizeLabel = '') => {
  const s = String(sizeLabel).toLowerCase();
  if (s.includes('student') || s.includes('3/4')) return -0.08;
  if (s.includes('full size') || s.includes('standard')) return 0;
  if (s.includes('concert') || s.includes('tenor')) return 0.06;
  if (s.includes('left-handed')) return 0.05;
  if (s.includes('intermediate')) return 0.12;
  if (s.includes('professional')) return 0.2;
  if (s.includes('electric pack')) return 0.14;
  return 0;
};

/** Animated orbit ring behind product image */
const OrbitRing = ({ styles }) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 16000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={[
        styles.orbitRing,
        { transform: [{ rotate }] },
      ]}
    />
  );
};

const ProductDetailScreen = ({ navigation, route }) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  
  const { productId } = route.params;
  const dispatch = useDispatch();
  const { selectedProduct: product, loading } = useSelector((s) => s.product);
  const { reviews } = useSelector((s) => s.review);
  const { user } = useSelector((s) => s.auth);

  const [selectedSize, setSelectedSize] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [ingrExpanded, setIngrExpanded] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const carouselRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProductById(productId));
    dispatch(fetchProductReviews(productId));
  }, [productId]);

  const buildImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/300';
    return path.startsWith('http') ? path : `${BASE_URL.replace('/api', '')}${path}`;
  };

  const images =
    product?.images?.length > 0
      ? product.images.map(buildImageUrl)
      : ['https://via.placeholder.com/300'];

  const handleBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  const handleAddToCart = async () => {
    if (product?.sizes?.length > 0 && !selectedSize) {
      Alert.alert('Select a variant', 'Please select a variant before adding to cart.');
      return;
    }
    const cartItem = {
      productId: product._id,
      name: product.name,
      image: images[0],
      price: selectedPrice,
      quantity: 1,
      size: selectedSize,
    };
    dispatch(addItem(cartItem));
    await insertCartItem(cartItem);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading || !product) {
    return <LoadingOverlay message="Loading product..." />;
  }

  const selectedPrice = Math.round(
    product.price * (1 + getSizePriceAdjustment(selectedSize || ''))
  );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Back + Cart header overlay */}
      <View style={[styles.floatingHeader, { paddingTop: Platform.OS === 'ios' ? 54 : 36 }]}>
        <TouchableOpacity style={styles.floatBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={22} color={colors.primaryText} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.floatBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="bag-outline" size={22} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false} nestedScrollEnabled>
        {/* ── IMAGE CAROUSEL ─────────────────────────────────────── */}
        <View style={styles.carouselWrapper}>
          <OrbitRing styles={styles} />
          <FlatList
            ref={carouselRef}
            data={images}
            horizontal
            pagingEnabled
            nestedScrollEnabled
            directionalLockEnabled
            scrollEnabled={images.length > 1}
            bounces={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => String(idx)}
            onMomentumScrollEnd={(e) => {
              setCarouselIndex(
                Math.round(e.nativeEvent.contentOffset.x / SCREEN_W),
              );
            }}
            renderItem={({ item }) => (
              <View style={styles.carouselSlide}>
                <Image
                  source={{ uri: item }}
                  style={styles.carouselImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Dot indicators */}
          {images.length > 1 && (
            <View style={styles.dotsRow}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, idx === carouselIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Discount badge */}
          {product.discountPercent > 0 && (
            <DiscountBadge
              percent={product.discountPercent}
              style={styles.carouselBadge}
            />
          )}
        </View>

        {/* ── PRODUCT INFO ──────────────────────────────────────── */}
        <View style={styles.body}>
          {/* Brand + Name */}
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating row */}
          <View style={styles.ratingRow}>
            <RatingStars rating={Number(avgRating)} size={16} />
            <Text style={styles.ratingNum}>{avgRating}</Text>
            <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
          </View>

          {/* Price row */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ₱{selectedPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Text>
            {product.originalPrice > product.price && (
              <Text style={styles.originalPrice}>
                ₱{product.originalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </Text>
            )}
          </View>

          {/* ── VARIANT SELECTOR ──────────────────────────────── */}
          {product.sizes?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Variant</Text>
              <View style={styles.sizesRow}>
                {product.sizes.map((sz) => (
                  <SizeChip
                    key={sz}
                    label={sz}
                    selected={selectedSize === sz}
                    onPress={() => setSelectedSize(selectedSize === sz ? null : sz)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ── AR DISCOVERY BANNER ──────────────────────────── */}
          <TouchableOpacity
            style={styles.arBanner}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('ARView', { product })}
          >
            <Ionicons name="cube-outline" size={22} color={colors.accent} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.arBannerTitle}>Try in Augmented Reality</Text>
              <Text style={styles.arBannerSub}>See how it looks in your space</Text>
            </View>
            <View style={styles.arBannerArrow}>
              <Ionicons name="arrow-forward" size={16} color={colors.surface} />
            </View>
          </TouchableOpacity>

          {/* ── DESCRIPTION ──────────────────────────────────── */}
          <View style={styles.accordionCard}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setDescExpanded(!descExpanded)}
              activeOpacity={0.8}
            >
              <Text style={styles.accordionTitle}>Description</Text>
              <Ionicons
                name={descExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.secondaryText}
              />
            </TouchableOpacity>
            {descExpanded && (
              <Text style={styles.accordionBody}>{product.description}</Text>
            )}
          </View>

          {/* ── INGREDIENTS ──────────────────────────────────── */}
          {product.ingredients && (
            <View style={styles.accordionCard}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setIngrExpanded(!ingrExpanded)}
                activeOpacity={0.8}
              >
                <Text style={styles.accordionTitle}>Ingredients</Text>
                <Ionicons
                  name={ingrExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
              {ingrExpanded && (
                <Text style={styles.accordionBody}>{product.ingredients}</Text>
              )}
            </View>
          )}

          {/* ── REVIEWS ──────────────────────────────────────── */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('WriteReview', { productId: product._id, productName: product.name })}
              >
                <Text style={styles.writeReviewLink}>Write a review</Text>
              </TouchableOpacity>
            </View>

            {reviews.length === 0 ? (
              <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
            ) : (
              reviews.slice(0, 5).map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  canEdit={Boolean(user?._id && (review?.user?._id === user._id || review?.user === user._id))}
                  onEdit={() =>
                    navigation.navigate('WriteReview', {
                      productId: product._id,
                      productName: product.name,
                      orderId: review?.order,
                      review,
                    })
                  }
                />
              ))
            )}

            {reviews.length > 5 && (
              <TouchableOpacity style={styles.viewAllReviews}>
                <Text style={styles.viewAllText}>View all {reviews.length} reviews</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Spacer for sticky bottom */}
          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* ── STICKY BOTTOM CTA ─────────────────────────────────── */}
      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={styles.arViewBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ARView', { product })}
        >
          <Ionicons name="cube-outline" size={20} color={colors.surface} />
          <Text style={styles.arViewBtnText}>AR View</Text>
        </TouchableOpacity>

        <View style={styles.addToCartWrapper}>
          <AppButton
            label={addedToCart ? '✓ Added!' : 'Add to Cart'}
            variant={addedToCart ? 'dark' : 'lime'}
            onPress={handleAddToCart}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  /* Floating header */
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  floatBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  /* Carousel */
  carouselWrapper: {
    width: SCREEN_W,
    height: CAROUSEL_HEIGHT,
    backgroundColor: colors.imageCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRing: {
    position: 'absolute',
    width: CAROUSEL_HEIGHT * 0.9,
    height: CAROUSEL_HEIGHT * 0.9,
    borderRadius: (CAROUSEL_HEIGHT * 0.9) / 2,
    borderWidth: 1,
    borderColor: 'rgba(170, 238, 68, 0.35)',
    borderStyle: 'dashed',
  },
  carouselSlide: {
    width: SCREEN_W,
    height: CAROUSEL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselImage: {
    width: SCREEN_W * 0.65,
    height: CAROUSEL_HEIGHT * 0.75,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dotActive: {
    backgroundColor: colors.primaryText,
    width: 20,
  },
  carouselBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
  },

  /* Body */
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  brand: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 13,
    color: colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  name: {
    fontFamily: 'Syne_700Bold',
    fontSize: 26,
    color: colors.primaryText,
    marginTop: 6,
    lineHeight: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  ratingNum: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: colors.primaryText,
  },
  reviewCount: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.secondaryText,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 14,
    gap: 12,
  },
  price: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    color: colors.primaryText,
  },
  originalPrice: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.secondaryText,
    textDecorationLine: 'line-through',
  },

  /* Size */
  section: { marginTop: 24 },
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: colors.primaryText,
    marginBottom: 12,
  },
  sizesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  /* AR banner */
  arBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryText,
    borderRadius: 20,
    padding: 16,
    marginTop: 24,
  },
  arBannerTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: colors.surface,
  },
  arBannerSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: colors.surface + 'A0', // Added transparency
    marginTop: 2,
  },
  arBannerArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface + '26', // Added transparency
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Accordions */
  accordionCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginTop: 16,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  accordionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: colors.primaryText,
  },
  accordionBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 22,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  /* Reviews */
  reviewsSection: { marginTop: 32 },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewLink: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: colors.selectedChip,
  },
  noReviews: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
    paddingVertical: 24,
  },
  viewAllReviews: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  viewAllText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: colors.selectedChip,
  },

  /* Sticky bottom */
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 14,
  },
  arViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryText,
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 8,
  },
  arViewBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: colors.surface,
  },
  addToCartWrapper: {
    flex: 1,
  },
});

export default ProductDetailScreen;
