import React, { useEffect, useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders } from '../../redux/slices/orderSlice';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import IconButton from '../../components/buttons/IconButton';
import { useAppTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/formatCurrency';
import SidebarContext from '../../navigation/SidebarContext';

const AdminDashboardScreen = ({ navigation }) => {
  const { openSidebar } = useContext(SidebarContext);
  const dispatch = useDispatch();
  const { orders } = useSelector(state => state.order);
  const { products } = useSelector(state => state.product);
  const { colors } = useAppTheme();
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  useEffect(() => {
    if (orders.length > 0) {
      const sales = orders.reduce((acc, current) => acc + current.totalPrice, 0);
      setTotalSales(sales);
    }
  }, [orders]);

  const handleOpenMenu = () => {
    if (typeof navigation.openDrawer === 'function') {
      navigation.openDrawer();
      return;
    }
    navigation.getParent?.()?.openDrawer?.();
    openSidebar?.();
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <Text variant="h3" weight="bold" style={{ marginTop: 12, color: colors.primaryText }}>{value}</Text>
      <Text variant="bodySmall" color="secondary">{title}</Text>
    </View>
  );

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <IconButton icon="menu" color={colors.primaryText} onPress={handleOpenMenu} />
        <Text variant="h3" weight="bold">Admin Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Revenue" 
            value={formatCurrency(totalSales)} 
            icon="currency-usd" 
            color="#3B82F6" 
          />
          <StatCard 
            title="Total Orders" 
            value={orders.length} 
            icon="receipt" 
            color={colors.success} 
          />
          <StatCard 
            title="Total Products" 
            value={products.length} 
            icon="cellphone" 
            color={colors.primary} 
          />
        </View>

        <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>Management</Text>
        
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} onPress={() => navigation.navigate('ProductManagement')}>
          <MaterialCommunityIcons name="package-variant" size={24} color={colors.primary} />
          <Text variant="body" weight="semiBold" style={[styles.menuText, { color: colors.primaryText }]}>Product Management</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} onPress={() => navigation.navigate('OrderManagement')}>
          <MaterialCommunityIcons name="truck-delivery" size={24} color={colors.primary} />
          <Text variant="body" weight="semiBold" style={[styles.menuText, { color: colors.primaryText }]}>Order Management</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} onPress={() => navigation.navigate('AdminUsers')}>
          <MaterialCommunityIcons name="account-group" size={24} color={colors.primary} />
          <Text variant="body" weight="semiBold" style={[styles.menuText, { color: colors.primaryText }]}>User Management</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray[400]} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} onPress={() => navigation.navigate('AdminAnalytics')}>
          <MaterialCommunityIcons name="chart-line" size={24} color={colors.primary} />
          <Text variant="body" weight="semiBold" style={[styles.menuText, { color: colors.primaryText }]}>Analytics</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.gray[400]} />
        </TouchableOpacity>
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
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
  }
});

export default AdminDashboardScreen;
