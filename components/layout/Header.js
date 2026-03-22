import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import SidebarContext from '../../navigation/SidebarContext';

const Header = ({
  title,
  showBack = false,
  showCart = false,
  showMenu = false,
  onSearch,
  rightAction,
}) => {
  const navigation = useNavigation();
  const { openSidebar } = useContext(SidebarContext);
  const cartItems = useSelector((s) => s.cart.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleOpenMenu = () => {
    if (typeof navigation.openDrawer === 'function') {
      navigation.openDrawer();
      return;
    }
    navigation.getParent?.()?.openDrawer?.();
    openSidebar?.();
  };

  const handleBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  return (
    <View style={styles.header}>
      {/* Left side */}
      <View style={styles.left}>
        {showMenu && (
          <TouchableOpacity style={styles.iconBtn} onPress={handleOpenMenu}>
            <Ionicons name="menu-outline" size={26} color={colors.primaryText} />
          </TouchableOpacity>
        )}
        {showBack && (
          <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      {/* Right side */}
      <View style={styles.right}>
        {onSearch && (
          <TouchableOpacity style={styles.iconBtn} onPress={onSearch}>
            <Ionicons name="search-outline" size={24} color={colors.primaryText} />
          </TouchableOpacity>
        )}
        {showCart && (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Ionicons name="bag-outline" size={24} color={colors.primaryText} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        {rightAction && (
          <TouchableOpacity style={styles.iconBtn} onPress={rightAction.onPress}>
            <Ionicons name={rightAction.icon} size={24} color={colors.primaryText} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  left: {
    width: 48,
    alignItems: 'flex-start',
  },
  right: {
    width: 48,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
    color: colors.primaryText,
  },
  iconBtn: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: colors.primaryText,
  },
});

export default Header;
