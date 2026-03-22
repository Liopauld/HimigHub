import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import Text from '../../components/typography/Text';
import Button from '../../components/buttons/Button';
import { useAppTheme } from '../../context/ThemeContext';
import { BASE_URL } from '../../redux/api/axiosConfig';

const ARViewScreen = ({ navigation, route }) => {
  const { product } = route.params || {};
  const { colors } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [showProductOverlay, setShowProductOverlay] = useState(true);

  const getProductImageUri = () => {
    const firstImage = product?.images?.[0] || '';
    if (!firstImage) return '';
    return firstImage.startsWith('http')
      ? firstImage
      : `${BASE_URL.replace('/api', '')}${firstImage}`;
  };

  const productImageUri = getProductImageUri();

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  // Request camera permission on mount
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  const handleRotateProduct = () => {
    Animated.sequence([
      Animated.timing(rotation, {
        toValue: 360,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      rotation.setValue(0);
    });
  };

  const handleZoomIn = () => {
    Animated.spring(scale, {
      toValue: 1.4,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleZoomOut = () => {
    Animated.spring(scale, {
      toValue: Math.max(0.8, 0.8),
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleReset = () => {
    Animated.parallel([
      Animated.timing(rotation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  const handleAddToCart = () => {
    Alert.alert('Success', 'Product added to cart!', [
      { text: 'Continue Shopping', onPress: handleBack },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };
  // If no permission
  if (!permission) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="camera-off"
            size={64}
            color={colors.secondaryText}
          />
          <Text variant="h4" weight="bold" style={{ marginTop: 16 }}>
            Camera Required
          </Text>
          <Text
            variant="body"
            color="secondary"
            align="center"
            style={{ marginTop: 8, maxWidth: 280 }}
          >
            AR preview needs camera access. Please enable it in app settings.
          </Text>
          <Button title="Go Back" onPress={handleBack} style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="camera-outline"
            size={64}
            color={colors.primary}
          />
          <Text variant="h4" weight="bold" style={{ marginTop: 16 }}>
            Enable Camera
          </Text>
          <Text
            variant="body"
            color="secondary"
            align="center"
            style={{ marginTop: 8, maxWidth: 280 }}
          >
            Grant camera permission to view products in AR
          </Text>
          <Button
            title="Enable Camera"
            onPress={requestPermission}
            style={{ marginTop: 24 }}
          />
          <TouchableOpacity onPress={handleBack} style={{ marginTop: 12 }}>
            <Text variant="body" color="secondary">
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text variant="h3" weight="bold">
          AR Preview
        </Text>
        <TouchableOpacity
          onPress={() => setShowProductOverlay(!showProductOverlay)}
          style={styles.headerBtn}
        >
          <MaterialCommunityIcons
            name={showProductOverlay ? 'eye-outline' : 'eye-off-outline'}
            size={24}
            color={colors.primaryText}
          />
        </TouchableOpacity>
      </View>

      {/* Camera or Placeholder */}
      <View style={styles.cameraContainer}>
        {permission.granted ? (
          <CameraView
            style={styles.camera}
            facing="back"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { backgroundColor: colors.surface, borderColor: colors.borderLight },
            ]}
          >
            <MaterialCommunityIcons
              name="camera"
              size={48}
              color={colors.secondaryText}
            />
            <Text variant="body" color="secondary" style={{ marginTop: 12 }}>
              Camera not available
            </Text>
          </View>
        )}

        {/* Product Overlay */}
        {showProductOverlay && (
          <View style={styles.productOverlay}>
            <Animated.View
              style={[
                styles.productFrame,
                {
                  transform: [
                    { perspective: 800 },
                    { rotate: rotateInterpolate },
                    { scale: scale },
                  ],
                },
              ]}
            >
              {productImageUri ? (
                <Image
                  source={{ uri: productImageUri }}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.fallbackBadge, { backgroundColor: colors.surface }]}> 
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={60}
                    color={colors.primary}
                  />
                </View>
              )}
              <View style={styles.productNameChip}>
                <Text variant="caption" style={styles.productNameText}>
                  {product?.name?.substring(0, 28) || 'Product'}
                </Text>
              </View>
            </Animated.View>
          </View>
        )}

        {/* Controls Overlay */}
        <View style={[styles.controlsBottom, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
          <View style={styles.controlRow}>
            <TouchableOpacity
              style={[
                styles.controlBtn,
                { backgroundColor: colors.primary + '99' },
              ]}
              onPress={handleRotateProduct}
            >
              <MaterialCommunityIcons
                name="rotate-right"
                size={24}
                color="white"
              />
              <Text variant="caption" style={{ color: 'white', marginTop: 4 }}>
                Rotate
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlBtn,
                { backgroundColor: colors.primary + '99' },
              ]}
              onPress={handleZoomIn}
            >
              <MaterialCommunityIcons name="magnify-plus" size={24} color="white" />
              <Text variant="caption" style={{ color: 'white', marginTop: 4 }}>
                Zoom In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlBtn,
                { backgroundColor: colors.primary + '99' },
              ]}
              onPress={handleZoomOut}
            >
              <MaterialCommunityIcons name="magnify-minus" size={24} color="white" />
              <Text variant="caption" style={{ color: 'white', marginTop: 4 }}>
                Zoom Out
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlBtn,
                { backgroundColor: colors.error + '99' },
              ]}
              onPress={handleReset}
            >
              <MaterialCommunityIcons name="refresh" size={24} color="white" />
              <Text variant="caption" style={{ color: 'white', marginTop: 4 }}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer Info */}
      {product && (
        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <Text variant="h4" weight="bold" style={{ color: colors.primaryText }}>
            {product.name}
          </Text>
          <Text
            variant="body"
            color="secondary"
            style={{ marginTop: 6, lineHeight: 20 }}
          >
            {product.description?.substring(0, 100)}
            {product.description?.length > 100 ? '...' : ''}
          </Text>
          <View style={{ marginTop: 12 }}>
            <Text
              variant="h3"
              weight="bold"
              style={{ color: colors.primary }}
            >
              ${product.basePrice?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <Button
            title="Add to Cart"
            onPress={handleAddToCart}
            style={{ marginTop: 12 }}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  productOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: 190,
    height: 190,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 14,
  },
  fallbackBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productNameChip: {
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  productNameText: {
    color: '#FFFFFF',
  },
  controlsBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: 8,
  },
  controlBtn: {
    width: 70,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
});

export default ARViewScreen;
