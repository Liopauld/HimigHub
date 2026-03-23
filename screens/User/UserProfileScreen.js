import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../../redux/slices/authSlice';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import Input from '../../components/inputs/Input';
import Button from '../../components/buttons/Button';
import IconButton from '../../components/buttons/IconButton';
import { BASE_URL } from '../../redux/api/axiosConfig';
import SidebarContext from '../../navigation/SidebarContext';
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

const UserProfileScreen = ({ navigation }) => {
  const { openSidebar } = useContext(SidebarContext);
  const { colors, mode, setMode } = useAppTheme();
  const dispatch = useDispatch();
  const { user, loading } = useSelector(state => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [stateValue, setStateValue] = useState(user?.address?.state || '');
  const [zip, setZip] = useState(user?.address?.zip || '');
  const [country, setCountry] = useState(user?.address?.country || '');

  const handleUpdate = () => {
    if (!name || !email) {
      notifyError('Validation Error', 'Name and Email are required.');
      return;
    }
    if (!String(phone || '').trim()) {
      notifyError('Validation Error', 'Phone number is required.');
      return;
    }
    const payload = {
      name,
      email,
      phone: String(phone || '').trim(),
      address: {
      street: street.trim(),
      city: city.trim(),
      state: stateValue.trim(),
      zip: zip.trim(),
      country: country.trim(),
      },
    };
    
    dispatch(updateProfile(payload)).then((res) => {
      if (!res.error) {
        notifySuccess('Profile Updated', 'Profile updated successfully.');
      } else {
        const message = String(res.payload || 'Failed to update profile');
        if (shouldShowLocalSaveError(message)) {
          notifyError('Profile Update Failed', message);
        }
      }
    });
  };

  const avatarRaw = typeof user?.avatar === 'string' ? user.avatar : '';
  const avatarVersion = user?.updatedAt ? new Date(user.updatedAt).getTime() : null;
  const avatarUrl = avatarRaw
    ? (avatarRaw.startsWith('http') ? avatarRaw : `${BASE_URL.replace('/api', '')}${avatarRaw}`)
    : 'https://via.placeholder.com/150';
  const avatarDisplayUrl = avatarVersion
    ? `${avatarUrl}${avatarUrl.includes('?') ? '&' : '?'}v=${avatarVersion}`
    : avatarUrl;

  const handleOpenMenu = () => {
    if (typeof navigation.openDrawer === 'function') {
      navigation.openDrawer();
      return;
    }
    navigation.getParent?.()?.openDrawer?.();
    openSidebar?.();
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <IconButton icon="menu" onPress={handleOpenMenu} />
        <Text variant="h3" weight="bold">Profile</Text>
        <IconButton icon="pencil-outline" onPress={() => navigation.navigate('EditProfile')} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: avatarDisplayUrl }} style={[styles.avatar, { backgroundColor: colors.imageCard }]} />
          <View style={[styles.roleBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
            <Text variant="caption" weight="bold" color="light">{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Input 
            label="Full Name" 
            value={name} 
            onChangeText={setName} 
          />
          <Input 
            label="Email Address" 
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none" 
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. 09171234567"
          />

          <Input
            label="Street"
            value={street}
            onChangeText={setStreet}
            placeholder="House no. and street"
          />
          <Input
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="City"
          />
          <Input
            label="State / Province"
            value={stateValue}
            onChangeText={setStateValue}
            placeholder="State or Province"
          />
          <Input
            label="Zip / Postal Code"
            value={zip}
            onChangeText={setZip}
            placeholder="Zip code"
          />
          <Input
            label="Country"
            value={country}
            onChangeText={setCountry}
            placeholder="Country"
          />
          
          <Button 
            title="Update Profile" 
            onPress={handleUpdate} 
            loading={loading}
            style={styles.updateBtn}
          />

          <View style={[styles.themeCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text variant="bodySmall" weight="semiBold" color="secondary" style={styles.themeTitle}>
              Appearance
            </Text>
            <View style={styles.themeToggleRow}>
              {[
                { key: 'light', label: 'Light' },
                { key: 'dark', label: 'Dark' },
                { key: 'system', label: 'System' },
              ].map((item) => {
                const active = mode === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    onPress={() => setMode(item.key)}
                    style={[
                      styles.themeChip,
                      {
                        backgroundColor: active ? colors.primary : colors.gray[100],
                        borderColor: active ? colors.primary : colors.borderLight,
                      },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Text
                      variant="caption"
                      weight="semiBold"
                      style={{ color: active ? colors.white : colors.primaryText }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  scroll: {
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 2,
  },
  form: {
    flex: 1,
  },
  updateBtn: {
    marginTop: 24,
  },
  themeCard: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  themeTitle: {
    marginBottom: 10,
  },
  themeToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
  },
});

export default UserProfileScreen;
