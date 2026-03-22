import React, { useEffect, useCallback, useContext } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../redux/slices/orderSlice';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import OrderCard from '../../components/cards/OrderCard';
import IconButton from '../../components/buttons/IconButton';
import SidebarContext from '../../navigation/SidebarContext';
import { useAppTheme } from '../../context/ThemeContext';

const OrderHistoryScreen = ({ navigation }) => {
  const { openSidebar } = useContext(SidebarContext);
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(state => state.order);
  const { colors } = useAppTheme();

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = useCallback(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

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
        <IconButton icon="menu" color={colors.primaryText} onPress={handleOpenMenu} />
        <Text variant="h3" weight="bold">My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && orders.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <OrderCard 
              order={item} 
              onPress={() => navigation.navigate('OrderDetails', { id: item._id })} 
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadOrders} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text variant="body" color="secondary">No orders found.</Text>
            </View>
          }
        />
      )}
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
  list: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  }
});

export default OrderHistoryScreen;
