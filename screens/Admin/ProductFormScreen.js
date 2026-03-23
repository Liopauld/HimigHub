import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { createProduct, updateProduct, fetchProductById } from '../../redux/slices/productSlice';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import SizeChip from '../../components/common/SizeChip';
import { useAppTheme } from '../../context/ThemeContext';
import { notifyError, notifySuccess } from '../../utils/appNotifier';

const AVAILABLE_SIZES = [
  'Soprano',
  'Concert',
  'Tenor',
  'Student',
  'Intermediate',
  'Professional',
  '3/4 Size',
  'Full Size',
  'Left-Handed',
  'Standard',
  'Acoustic Pack',
  'Electric Pack',
];
const CATEGORIES = ['Wind', 'String', 'Percussion', 'Accessories'];
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];

const extractImageExtension = (uri) => {
  const normalized = String(uri || '').split('?')[0].split('#')[0];
  const extMatch = normalized.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch?.[1]?.toLowerCase();
  if (ext && ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return ext;
  }
  return 'jpg';
};

const toMimeType = (ext) => {
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    default:
      return 'image/jpeg';
  }
};

const getErrorMessage = (err, fallback) => {
  if (typeof err === 'string' && err.trim()) return err;
  if (typeof err?.message === 'string' && err.message.trim()) return err.message;
  if (typeof err?.response?.data?.message === 'string' && err.response.data.message.trim()) {
    return err.response.data.message;
  }
  return fallback;
};

const shouldShowLocalSaveError = (message) => {
  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('cannot reach backend at')) return false;
  if (normalized.includes('timed out while connecting')) return false;
  if (normalized.includes('upload request timed out')) return false;
  if (normalized.includes('network error')) return false;
  if (normalized.includes('request failed (')) return false;
  return true;
};

const ProductFormScreen = ({ navigation, route }) => {
  const { productId } = route.params || {};
  const isEdit = !!productId;
  const dispatch = useDispatch();
  const { selectedProduct, loading } = useSelector((s) => s.product);
  const authUser = useSelector((s) => s.auth?.user);
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [images, setImages] = useState([]);
  const [stock, setStock] = useState('0');
  const [isAvailable, setIsAvailable] = useState(true);
  const [discountPercent, setDiscountPercent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchProductById(productId));
    }
  }, [productId]);

  useEffect(() => {
    if (isEdit && selectedProduct) {
      setName(selectedProduct.name || '');
      setBrand(selectedProduct.brand || '');
      setPrice(String(selectedProduct.price || ''));
      setOriginalPrice(String(selectedProduct.originalPrice || ''));
      setDescription(selectedProduct.description || '');
      setIngredients(selectedProduct.ingredients || '');
      setCategory(selectedProduct.category || CATEGORIES[0]);
      setSelectedSizes(selectedProduct.sizes || []);
      setImages(selectedProduct.images || []);
      setStock(String(selectedProduct.stock ?? '0'));
      setIsAvailable(selectedProduct.isAvailable ?? true);
      setDiscountPercent(String(selectedProduct.discountPercent || ''));
    }
  }, [selectedProduct]);

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || ImagePicker.MediaType?.images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const uris = (result.assets || []).map((a) => a.uri).filter(Boolean);
        setImages((prev) => [...prev, ...uris].slice(0, 6));
      }
    } catch (err) {
      Alert.alert('Image Picker Error', err?.message || 'Failed to open image library.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow camera access.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || ImagePicker.MediaType?.images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const uris = (result.assets || []).map((a) => a.uri).filter(Boolean);
        setImages((prev) => [...prev, ...uris].slice(0, 6));
      }
    } catch (err) {
      Alert.alert('Camera Error', err?.message || 'Failed to open camera.');
    }
  };

  const toggleSize = (sz) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz],
    );
  };

  const handleSave = async () => {
    if (authUser?.role !== 'admin') {
      Alert.alert('Admin access required', 'Only admin accounts can create or update products.');
      return;
    }

    if (!name.trim() || !brand.trim() || !price || !stock) {
      Alert.alert('Missing fields', 'Name, brand, price, and stock are required.');
      return;
    }
    const priceNum = parseFloat(price);
    const stockNum = parseInt(stock, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid price', 'Please enter a valid price.');
      return;
    }
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Invalid stock', 'Please enter a valid stock quantity.');
      return;
    }

    setSaving(true);

    const productPayload = {
      name: name.trim(),
      brand: brand.trim(),
      price: String(priceNum),
      description: description.trim(),
      ingredients: ingredients.trim(),
      category,
      stock: String(stockNum),
      isAvailable,
      sizes: selectedSizes,
    };

    if (originalPrice) productPayload.originalPrice = String(parseFloat(originalPrice));
    if (discountPercent) productPayload.discountPercent = String(parseInt(discountPercent, 10));

    const localImages = images.filter((uri) => !String(uri).startsWith('http'));
    const shouldUseMultipart = localImages.length > 0;

    let requestPayload = productPayload;
    if (shouldUseMultipart) {
      const formData = new FormData();
      formData.append('name', productPayload.name);
      formData.append('brand', productPayload.brand);
      formData.append('price', productPayload.price);
      formData.append('description', productPayload.description);
      formData.append('ingredients', productPayload.ingredients);
      formData.append('category', productPayload.category);
      formData.append('stock', productPayload.stock);
      formData.append('isAvailable', String(productPayload.isAvailable));
      if (productPayload.originalPrice) formData.append('originalPrice', productPayload.originalPrice);
      if (productPayload.discountPercent) formData.append('discountPercent', productPayload.discountPercent);
      formData.append('sizes', JSON.stringify(productPayload.sizes || []));

      localImages.forEach((uri, idx) => {
        const ext = extractImageExtension(uri);
        const mime = toMimeType(ext);
        formData.append('images', {
          uri,
          name: `image_${idx}.${ext}`,
          type: mime,
        });
      });
      requestPayload = formData;
    }

    try {
      if (isEdit) {
        await dispatch(updateProduct({ id: productId, data: requestPayload })).unwrap();
        notifySuccess('Product Updated', 'Product updated successfully.');
      } else {
        await dispatch(createProduct(requestPayload)).unwrap();
        notifySuccess('Product Created', 'Product created successfully.');
      }
      navigation.goBack();
    } catch (err) {
      const errorMessage = getErrorMessage(err, 'Failed to save product.');
      if (shouldShowLocalSaveError(errorMessage)) {
        notifyError('Save Failed', errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {(loading || saving) && <LoadingOverlay message={saving ? 'Saving...' : 'Loading...'} />}

      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 0 : 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Product' : 'New Product'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Product Images */}
        <Text style={styles.sectionTitle}>Product Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {images.map((uri, idx) => (
            <View key={idx} style={styles.imageItem}>
              <Image source={{ uri }} style={styles.imageThumbnail} />
              <TouchableOpacity
                style={styles.removeImage}
                onPress={() => setImages((p) => p.filter((_, i) => i !== idx))}
              >
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 6 && (
            <View style={styles.addButtonsWrap}>
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages}>
                <Ionicons name="images-outline" size={24} color={colors.secondaryText} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addImageBtn, { marginLeft: 10 }]} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Basic Info */}
        <Text style={styles.sectionTitle}>Basic Info</Text>
        {[
          { label: 'Product Name', value: name, onChange: setName, placeholder: 'e.g. Aurora Dreadnought Acoustic Guitar' },
          { label: 'Brand', value: brand, onChange: setBrand, placeholder: 'e.g. Yamaha' },
          { label: 'Price (₱)', value: price, onChange: setPrice, placeholder: '0.00', keyboard: 'numeric' },
          { label: 'Original Price (₱, optional)', value: originalPrice, onChange: setOriginalPrice, placeholder: '0.00', keyboard: 'numeric' },
          { label: 'Discount %', value: discountPercent, onChange: setDiscountPercent, placeholder: '0', keyboard: 'numeric' },
          { label: 'Stock', value: stock, onChange: setStock, placeholder: '0', keyboard: 'numeric' },
        ].map((field) => (
          <View key={field.label} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.inputBox}
              value={field.value}
              onChangeText={field.onChange}
              placeholder={field.placeholder}
              placeholderTextColor={colors.secondaryText}
              keyboardType={field.keyboard || 'default'}
            />
          </View>
        ))}

        {/* Category */}
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, category === cat && styles.catChipSelected]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catChipText, category === cat && styles.catChipTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sizes */}
        <Text style={styles.sectionTitle}>Available Variants</Text>
        <View style={styles.sizesWrap}>
          {AVAILABLE_SIZES.map((sz) => (
            <SizeChip
              key={sz}
              label={sz}
              selected={selectedSizes.includes(sz)}
              onPress={() => toggleSize(sz)}
            />
          ))}
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description / Key Features</Text>
        <TextInput
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe tone, build materials, and ideal skill level..."
          placeholderTextColor={colors.secondaryText}
          multiline
          textAlignVertical="top"
        />

        {/* Technical notes */}
        <Text style={styles.sectionTitle}>Technical Notes (optional)</Text>
        <TextInput
          style={styles.textArea}
          value={ingredients}
          onChangeText={setIngredients}
          placeholder="Scale length, key, pickups, shell material, included accessories..."
          placeholderTextColor={colors.secondaryText}
          multiline
          textAlignVertical="top"
        />

        {/* Toggles */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Available for Sale</Text>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#D0D0D0', true: colors.accent }}
            thumbColor="#FFF"
          />
        </View>

        <View style={styles.saveBtn}>
          <AppButton
            label={isEdit ? 'Save Changes' : 'Create Product'}
            variant="lime"
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    color: colors.primaryText,
  },
  scroll: { paddingHorizontal: 24, paddingBottom: 60 },
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 12,
  },
  imageScroll: { marginBottom: 4 },
  addButtonsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageItem: { position: 'relative', marginRight: 10 },
  imageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.imageCard,
  },
  removeImage: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E63B2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.imageCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
  },
  inputGroup: { marginBottom: 12 },
  label: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 6,
  },
  inputBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 50,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.primaryText,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  catChipSelected: { backgroundColor: colors.primaryText, borderColor: colors.primaryText },
  catChipText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: colors.primaryText },
  catChipTextSelected: { fontFamily: 'DMSans_700Bold', color: '#FFF' },
  sizesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.primaryText,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 12,
  },
  toggleLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.primaryText,
  },
  saveBtn: { marginTop: 32 },
});

export default ProductFormScreen;
