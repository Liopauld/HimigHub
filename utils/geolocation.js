import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to autofill your address.');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;
    const reverseGeocoded = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (reverseGeocoded && reverseGeocoded[0]) {
      const addr = reverseGeocoded[0];
      return {
        street: `${addr.streetNumber || ''} ${addr.street || 'Street'}`.trim(),
        city: addr.city || '',
        state: addr.region || '',
        zip: addr.postalCode || '',
        country: addr.country || '',
        latitude,
        longitude,
      };
    }

    return { latitude, longitude };
  } catch (error) {
    Alert.alert('Error', `Failed to get location: ${error.message}`);
    return null;
  }
};
