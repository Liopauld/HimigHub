import React, { useState } from 'react';
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
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { useAppTheme } from '../../context/ThemeContext';
import { notifyError, notifySuccess } from '../../utils/appNotifier';

const shouldShowLocalSaveError = (message) => {
  const normalized = String(message || '').toLowerCase();
  if (normalized.includes('cannot reach backend at')) return false;
  if (normalized.includes('timed out while connecting')) return false;
  if (normalized.includes('upload request timed out')) return false;
  if (normalized.includes('network error')) return false;
  if (normalized.includes('request failed (')) return false;
  return true;
};

const EditProfileScreen = ({ navigation }) => {
  const { colors } = useAppTheme();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [avatarMimeType, setAvatarMimeType] = useState(null);
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [stateValue, setStateValue] = useState(user?.address?.state || '');
  const [zip, setZip] = useState(user?.address?.zip || '');
  const [country, setCountry] = useState(user?.address?.country || '');
  const [gettingLocation, setGettingLocation] = useState(false);

  const getAvatarUploadMeta = (uri, pickedMimeType) => {
    const normalizedUri = String(uri || '').split('?')[0];
    const extension = (normalizedUri.split('.').pop() || '').toLowerCase();

    const extToMime = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      heic: 'image/heic',
      heif: 'image/heif',
    };

    const mimeType = pickedMimeType || extToMime[extension] || 'image/jpeg';
    const nameExtension = extension || (mimeType.includes('/') ? mimeType.split('/')[1] : 'jpg');

    return {
      name: `avatar.${nameExtension}`,
      type: mimeType,
    };
  };

  const handleGoBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('UserProfile');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      notifyError('Permission Required', 'Please allow photo library access to upload an avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions?.Images || ImagePicker.MediaType?.images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setAvatar(result.assets[0].uri);
      setAvatarMimeType(result.assets[0].mimeType || null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      notifyError('Permission Required', 'Please allow camera access to take an avatar photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions?.Images || ImagePicker.MediaType?.images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setAvatar(result.assets[0].uri);
      setAvatarMimeType(result.assets[0].mimeType || null);
    }
  };

  const chooseAvatarSource = () => {
    Alert.alert('Update Avatar', 'Choose image source', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const useCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        notifyError('Permission Denied', 'Location permission is required to use this feature.');
        setGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address details
      const reverseGeocodeResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocodeResult && reverseGeocodeResult.length > 0) {
        const address = reverseGeocodeResult[0];
        setStreet(address.street || address.name || '');
        setCity(address.city || '');
        setStateValue(address.region || '');
        setZip(address.postalCode || '');
        setCountry(address.country || '');
        notifySuccess('Location Set', 'Your address has been updated with current location.');
      } else {
        notifyError('Address Not Found', 'Coordinates found, but reverse geocoding returned no address. Please fill in manually.');
      }
    } catch (error) {
      notifyError('Location Error', 'Failed to get location: ' + (error?.message || 'Unknown error'));
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      notifyError('Validation Error', 'Name cannot be empty.');
      return;
    }
    if (!phone.trim()) {
      notifyError('Validation Error', 'Phone number is required.');
      return;
    }
    const addressPayload = {
      street: street.trim(),
      city: city.trim(),
      state: stateValue.trim(),
      zip: zip.trim(),
      country: country.trim(),
    };

    const avatarUri =
      typeof avatar === 'string'
        ? avatar
        : (avatar && typeof avatar === 'object' ? avatar.uri : '');
    const isDeviceImageUri = /^(file|content|ph):\/\//i.test(avatarUri);
    const hasNewLocalAvatar = Boolean(avatarUri && isDeviceImageUri);

    let payload;
    if (hasNewLocalAvatar) {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('address', JSON.stringify(addressPayload));

      const selectedAsset =
        avatar && typeof avatar === 'object'
          ? avatar
          : { uri: avatarUri, mimeType: avatarMimeType || undefined };
      const { name, type } = getAvatarUploadMeta(selectedAsset.uri, selectedAsset.mimeType);

      formData.append('avatar', {
        uri: selectedAsset.uri,
        name,
        type,
      });
      payload = formData;
    } else {
      payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: addressPayload,
      };
    }

    try {
      await dispatch(updateProfile(payload)).unwrap();
      notifySuccess('Profile Updated', 'Profile updated successfully.');
      handleGoBack();
    } catch (err) {
      const errorMessage = String(err || 'Failed to update profile.');
      if (shouldShowLocalSaveError(errorMessage)) {
        notifyError('Profile Update Failed', errorMessage);
      }
    }
  };

  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    backBtn: { padding: 8 },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'Syne_700Bold',
      fontSize: 22,
      color: colors.primaryText,
    },
    scroll: { paddingHorizontal: 24, paddingBottom: 50 },
    avatarWrapper: {
      alignSelf: 'center',
      marginVertical: 24,
      position: 'relative',
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.background,
    },
    avatarFallback: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.border || '#EBEBEB',
    },
    avatarInitial: {
      fontFamily: 'Syne_700Bold',
      fontSize: 42,
      color: colors.primaryText,
    },
    editBadge: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primaryText,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.background,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 4,
    },
    form: { gap: 16 },
    label: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 13,
      color: colors.secondaryText,
      marginBottom: 6,
      marginLeft: 4,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      borderWidth: 1,
      borderColor: colors.border || '#EBEBEB',
    },
    inputIcon: { marginRight: 12 },
    input: {
      flex: 1,
      fontFamily: 'DMSans_500Medium',
      fontSize: 16,
      color: colors.primaryText,
    },
    locationBtn: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginVertical: 8,
    },
    saveBtn: { marginTop: 32 },
  });

  return (
    <SafeAreaView style={styles.safe}>
      {loading && <LoadingOverlay message="Saving..." />}

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 0 : 16 }]}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar picker */}
          <TouchableOpacity style={styles.avatarWrapper} onPress={chooseAvatarSource} activeOpacity={0.8}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {name.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={18} color={colors.background} />
            </View>
          </TouchableOpacity>

          {/* Form */}
          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputBox}>
                <Ionicons name="person-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Phone</Text>
              <View style={styles.inputBox}>
                <Ionicons name="call-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+63 9XX XXX XXXX"
                  placeholderTextColor={colors.secondaryText}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={{ marginTop: 8 }}>
              <TouchableOpacity 
                style={[styles.locationBtn, { backgroundColor: colors.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }]}
                onPress={useCurrentLocation}
                disabled={gettingLocation}
                activeOpacity={0.8}
              >
                {gettingLocation ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Getting Location...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="location" size={18} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Use Current Location</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View>
              <Text style={styles.label}>Street</Text>
              <View style={styles.inputBox}>
                <Ionicons name="location-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={street}
                  onChangeText={setStreet}
                  placeholder="House no. and street"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>City</Text>
              <View style={styles.inputBox}>
                <Ionicons name="business-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>State / Province</Text>
              <View style={styles.inputBox}>
                <Ionicons name="map-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={stateValue}
                  onChangeText={setStateValue}
                  placeholder="State or Province"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Zip / Postal Code</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={zip}
                  onChangeText={setZip}
                  placeholder="Zip code"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Country</Text>
              <View style={styles.inputBox}>
                <Ionicons name="flag-outline" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Country"
                  placeholderTextColor={colors.secondaryText}
                />
              </View>
            </View>
          </View>

          <View style={styles.saveBtn}>
            <AppButton label="Save Changes" variant="primary" onPress={handleSave} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
