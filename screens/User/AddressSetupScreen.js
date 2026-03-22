import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import Input from '../../components/inputs/Input';
import Button from '../../components/buttons/Button';
import { updateProfile } from '../../redux/slices/authSlice';
import { useAppTheme } from '../../context/ThemeContext';
import { getCurrentLocation } from '../../utils/geolocation';

const isAddressComplete = (address) => {
  const a = address || {};
  return Boolean(a.street?.trim() && a.city?.trim() && a.zip?.trim() && a.country?.trim());
};

const AddressSetupScreen = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const { colors } = useAppTheme();

  const initialAddress = useMemo(() => user?.address || {}, [user]);

  const [street, setStreet] = useState(initialAddress.street || '');
  const [city, setCity] = useState(initialAddress.city || '');
  const [stateValue, setStateValue] = useState(initialAddress.state || '');
  const [zip, setZip] = useState(initialAddress.zip || '');
  const [country, setCountry] = useState(initialAddress.country || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [locatingAddress, setLocatingAddress] = useState(false);

  const handleUseCurrentLocation = async () => {
    setLocatingAddress(true);
    try {
      const locationData = await getCurrentLocation();
      if (locationData) {
        setStreet(locationData.street || '');
        setCity(locationData.city || '');
        setStateValue(locationData.state || '');
        setZip(locationData.zip || '');
        setCountry(locationData.country || '');
        Alert.alert('Success', 'Address autofilled from current location.');
      }
    } finally {
      setLocatingAddress(false);
    }
  };

  const handleSave = async () => {
    const address = {
      street: street.trim(),
      city: city.trim(),
      state: stateValue.trim(),
      zip: zip.trim(),
      country: country.trim(),
    };

    if (!isAddressComplete(address)) {
      Alert.alert('Required', 'Please complete Street, City, Zip, and Country.');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Required', 'Phone number is required to continue.');
      return;
    }

    const formData = new FormData();
    formData.append('phone', phone.trim());
    formData.append('address', JSON.stringify(address));

    const result = await dispatch(updateProfile(formData));
    if (result.error) {
      Alert.alert('Error', result.payload || 'Failed to save address');
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 40, 60) }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text variant="h2" weight="bold">Complete Your Address</Text>
            <Text variant="body" color="secondary" style={styles.subtitle}>
              Please add your delivery address before continuing.
            </Text>

            <Input label="Street" placeholder="House no. and street" value={street} onChangeText={setStreet} />
            <Input label="City" placeholder="City" value={city} onChangeText={setCity} />
            <Input label="State/Province" placeholder="State or Province" value={stateValue} onChangeText={setStateValue} />
            <Input label="Zip/Postal Code" placeholder="Zip code" value={zip} onChangeText={setZip} />
            <Input label="Country" placeholder="Country" value={country} onChangeText={setCountry} />
            <View style={styles.useLocationContainer}>
              <Button
                title={locatingAddress ? 'Getting Location...' : 'Use Current Location'}
                variant="outline"
                onPress={handleUseCurrentLocation}
                disabled={locatingAddress}
                icon={locatingAddress ? undefined : 'map-marker-outline'}
                iconPosition="left"
                fullWidth
              />
            </View>
            <Input
              label="Phone Number"
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Button
              title="Save and Continue"
              onPress={handleSave}
              loading={loading}
              style={styles.button}
            />
          </View>

          <View style={[styles.hintBox, { backgroundColor: colors.imageCard, borderColor: colors.borderLight }]}>
            <Text variant="caption" color="secondary" style={styles.hintText}>
              You can still edit this later in your Profile.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  content: {
    flex: 1,
    paddingBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    marginTop: 16,
  },
  useLocationContainer: {
    marginTop: 2,
    marginBottom: 16,
  },
  hintBox: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  hintText: {
    textAlign: 'center',
  }
});

export default AddressSetupScreen;
