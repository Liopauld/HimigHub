import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../../redux/slices/orderSlice';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import IconButton from '../../components/buttons/IconButton';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { BASE_URL } from '../../redux/api/axiosConfig';
import { printOrderReport } from '../../utils/printUtils';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { order, loading } = useSelector(state => state.order);
  const { colors } = useAppTheme();
  const status = order?.status || order?.orderStatus || 'Pending';
  const orderItems = order?.items || order?.orderItems || [];
  const shipping = order?.shippingAddress || order?.shippingInfo || {};

  const handleBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('OrderHistory');
  };

  useEffect(() => {
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const handlePrint = async () => {
    if (!order) return;
    try {
      await printOrderReport(order);
    } catch (error) {
      Alert.alert('Print failed', error?.message || 'Unable to print order report right now.');
    }
  };

  if (loading || !order) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return colors.warning;
      case 'Confirmed': return colors.info;
      case 'Preparing': return colors.info;
      case 'Out for Delivery': return colors.primary;
      case 'Delivered': return colors.success;
      case 'Cancelled': return colors.error;
      default: return colors.gray[500];
    }
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <IconButton icon="arrow-left" color={colors.primaryText} onPress={handleBack} />
        <Text variant="h3" weight="bold">Order Details</Text>
        <IconButton icon="printer-outline" color={colors.primaryText} onPress={handlePrint} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="h4" weight="semiBold" style={{ marginBottom: 16 }}>Order Info</Text>
          <View style={styles.row}>
            <Text variant="bodySmall" color="secondary">Order ID</Text>
            <Text variant="bodySmall">{order._id}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="bodySmall" color="secondary">Date</Text>
            <Text variant="bodySmall">{new Date(order.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="bodySmall" color="secondary">Status</Text>
            <Text variant="bodySmall" weight="bold" style={{ color: getStatusColor(status) }}>
              {status}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="h4" weight="semiBold" style={{ marginBottom: 16 }}>Shipping Details</Text>
          <Text variant="bodySmall">{shipping.street || shipping.address || '-'}</Text>
          <Text variant="bodySmall">{shipping.city || '-'}, {shipping.zip || shipping.postalCode || '-'}</Text>
          <Text variant="bodySmall">{shipping.country || '-'}</Text>
          {!!shipping.phoneNo && <Text variant="bodySmall" style={{ marginTop: 8 }}>Phone: {shipping.phoneNo}</Text>}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="h4" weight="semiBold" style={{ marginBottom: 16 }}>Items</Text>
          {orderItems.map((item, index) => {
            const imageUrl = item.image?.startsWith('http') ? item.image : `${BASE_URL.replace('/api', '')}${item.image}`;
            
            return (
              <View key={index} style={styles.itemRow}>
                <Image source={{ uri: imageUrl || 'https://via.placeholder.com/50' }} style={[styles.itemImage, { backgroundColor: colors.imageCard }]} />
                <View style={styles.itemDetails}>
                  <Text variant="bodySmall" numberOfLines={1}>{item.name}</Text>
                  <Text variant="caption" color="secondary">Qty: {item.quantity}</Text>
                </View>
                <Text variant="bodySmall" weight="semiBold">{formatCurrency(item.price * item.quantity)}</Text>
              </View>
            );
          })}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="h4" weight="semiBold" style={{ marginBottom: 16 }}>Payment Info</Text>
          <View style={styles.row}>
            <Text variant="bodySmall" color="secondary">Items Price</Text>
            <Text variant="bodySmall">{formatCurrency(order.itemsPrice)}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="bodySmall" color="secondary">Shipping Price</Text>
            <Text variant="bodySmall">{formatCurrency(order.shippingPrice)}</Text>
          </View>
          <View style={[styles.row, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: colors.borderLight }]}>
            <Text variant="body" weight="bold">Total Price</Text>
            <Text variant="body" weight="bold" color="primary">{formatCurrency(order.totalPrice)}</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  itemDetails: {
    flex: 1,
    paddingHorizontal: 12,
  }
});

export default OrderDetailsScreen;
