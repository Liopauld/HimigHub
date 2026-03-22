import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  Animated,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  Image
} from 'react-native';

import ShopStack from './ShopStack';
import OrderStack from './OrderStack';
import AdminStack from './AdminStack';
import UserStack from './UserStack';
import NotificationStack from './NotificationStack';
import { useAppTheme } from '../context/ThemeContext';
import Text from '../components/typography/Text';
import SidebarContext from './SidebarContext';
import { logout } from '../redux/slices/authSlice';
import { setOrderNavigationHandler } from '../utils/notificationNavigation';

const SIDEBAR_WIDTH = 290;

const DrawerNavigator = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  const [activeRoute, setActiveRoute] = React.useState('ShopStack');
  const [sidebarVisible, setSidebarVisible] = React.useState(false);
  const [initialOrderId, setInitialOrderId] = React.useState(null);
  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  React.useEffect(() => {
    if (!isAdmin && activeRoute === 'AdminStack') {
      setActiveRoute('ShopStack');
    }
  }, [isAdmin, activeRoute]);

  const openSidebar = React.useCallback(() => {
    if (sidebarVisible) return;
    setSidebarVisible(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [sidebarVisible, translateX]);

  const closeSidebar = React.useCallback(() => {
    Animated.timing(translateX, {
      toValue: -SIDEBAR_WIDTH,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setSidebarVisible(false);
    });
  }, [translateX]);

  const goTo = React.useCallback(
    (routeName) => {
      setActiveRoute(routeName);
      closeSidebar();
    },
    [closeSidebar]
  );

  const handleLogout = React.useCallback(() => {
    dispatch(logout());
    closeSidebar();
  }, [dispatch, closeSidebar]);

  const menuItems = [
    { route: 'ShopStack', label: 'Shop', icon: 'storefront-outline' },
    { route: 'OrderStack', label: 'Orders', icon: 'receipt-outline' },
    { route: 'NotificationStack', label: 'Alerts', icon: 'notifications-outline' },
    { route: 'UserStack', label: 'Profile', icon: 'person-outline' },
  ];

  if (isAdmin) {
    menuItems.push({ route: 'AdminStack', label: 'Admin', icon: 'settings-outline' });
  }

  React.useEffect(() => {
    setOrderNavigationHandler((orderId) => {
      setInitialOrderId(orderId);
      setActiveRoute('OrderStack');
      closeSidebar();
    });

    return () => setOrderNavigationHandler(null);
  }, [closeSidebar]);

  const renderActiveStack = () => {
    if (activeRoute === 'OrderStack') {
      return <OrderStack key={`order-${initialOrderId || 'history'}`} initialOrderId={initialOrderId} />;
    }
    if (activeRoute === 'NotificationStack') return <NotificationStack />;
    if (activeRoute === 'UserStack') return <UserStack />;
    if (activeRoute === 'AdminStack' && isAdmin) return <AdminStack />;
    return <ShopStack />;
  };

  const { colors } = useAppTheme();

  return (
    <SidebarContext.Provider value={{ openSidebar, closeSidebar }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>{renderActiveStack()}</View>

        <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
          {menuItems.map((item) => {
            const focused = activeRoute === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={styles.tabBtn}
                onPress={() => setActiveRoute(item.route)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={focused ? item.icon.replace('-outline', '') : item.icon}
                  size={22}
                  color={focused ? colors.primary : colors.secondaryText}
                />
                <Text variant="caption" color={focused ? 'primary' : 'secondaryText'}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {sidebarVisible && <Pressable style={styles.overlay} onPress={closeSidebar} />}

        <Animated.View style={[styles.sidebar, { transform: [{ translateX }], backgroundColor: colors.surface, borderRightColor: colors.borderLight }]}>
          <View style={[styles.brandArea, { borderBottomColor: colors.borderLight, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
            <Image source={require('../assets/logo.png')} style={{ width: 32, height: 32 }} resizeMode="contain" />
            <View>
              <Text variant="h3" weight="bold" color="primaryText">HIMIGHUB</Text>
              <Text variant="bodySmall" color="secondaryText">{user?.email || 'Welcome'}</Text>
            </View>
          </View>

          {menuItems.map((item) => {
            const focused = activeRoute === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={[styles.menuItem, focused && [styles.menuItemActive, { backgroundColor: colors.imageCard }]]}
                onPress={() => goTo(item.route)}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={focused ? colors.primary : colors.primaryText}
                />
                <Text
                  variant="body"
                  weight="semiBold"
                  color={focused ? 'primary' : 'primaryText'}
                  style={styles.menuLabel}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={[styles.sidebarFooter, { borderTopColor: colors.borderLight }]}>
            <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.errorLight }]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <Text variant="body" weight="semiBold" color="error" style={styles.menuLabel}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SidebarContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 62,
    paddingTop: 6,
    paddingBottom: 8,
    borderTopWidth: 1,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 56,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    zIndex: 40,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    paddingTop: 58,
    paddingHorizontal: 18,
    zIndex: 50,
  },
  brandArea: {
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  menuItemActive: {
  },
  menuLabel: {
    flex: 1,
  },
  sidebarFooter: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 24,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
});

export default DrawerNavigator;
