import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { clearCart } from '../../redux/slices/cartSlice';
import { deleteToken } from '../../db/sqlite';
import { colors } from '../../theme/colors';
import { BASE_URL } from '../../redux/api/axiosConfig';

const MENU_ITEMS = [
  { label: 'Home',          icon: 'home-outline',           screen: 'ShopStack' },
  { label: 'My Orders',     icon: 'receipt-outline',        screen: 'OrderStack' },
  { label: 'Profile',       icon: 'person-outline',         screen: 'UserStack' },
  { label: 'Notifications', icon: 'notifications-outline',  screen: 'NotificationStack' },
];

const ADMIN_ITEMS = [
  { label: 'Admin Dashboard', icon: 'grid-outline',         screen: 'AdminStack' },
];

const DrawerContent = (props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';
  const avatarRawUrl = user?.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `${BASE_URL.replace('/api', '')}${user.avatar}`)
    : null;
  const avatarVersion = user?.updatedAt ? new Date(user.updatedAt).getTime() : null;
  const avatarUrl = avatarRawUrl && avatarVersion
    ? `${avatarRawUrl}${avatarRawUrl.includes('?') ? '&' : '?'}v=${avatarVersion}`
    : avatarRawUrl;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await deleteToken();
          dispatch(clearCart());
          dispatch(logout());
        },
      },
    ]);
  };

  const navigate = (screen) => {
    navigation.navigate(screen);
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarRing}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{user?.name || 'Guest'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
      </View>

      <View style={styles.divider} />

      {/* Menu Items */}
      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigate(item.screen)}
            activeOpacity={0.75}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name={item.icon} size={20} color={colors.primaryText} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
          </TouchableOpacity>
        ))}

        {isAdmin && (
          <>
            <View style={styles.sectionLabel}>
              <Text style={styles.sectionText}>ADMIN</Text>
            </View>
            {ADMIN_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={styles.menuItem}
                onPress={() => navigate(item.screen)}
                activeOpacity={0.75}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#E8F0FF' }]}>
                  <Ionicons name={item.icon} size={20} color={colors.selectedChip} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} />

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#E63B2E" />
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>HIMIGHUB v1.0</Text>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 30,
    backgroundColor: colors.background,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.imageCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'Syne_700Bold',
    fontSize: 30,
    color: colors.primaryText,
  },
  name: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    color: colors.primaryText,
  },
  email: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDEDEC',
    marginHorizontal: 24,
    marginBottom: 8,
  },
  menu: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.imageCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.primaryText,
  },
  sectionLabel: {
    paddingHorizontal: 8,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: colors.secondaryText,
    letterSpacing: 1.2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
  },
  logoutLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#E63B2E',
    marginLeft: 12,
  },
  version: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default DrawerContent;
