import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import IconButton from '../../components/buttons/IconButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OrderCard from '../../components/cards/OrderCard';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { printOrderReport } from '../../utils/printUtils';

const OrderManagementScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);
  const { colors } = useAppTheme();
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedCurrentStatus, setSelectedCurrentStatus] = useState('Pending');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const statuses = useMemo(
    () => ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    []
  );

  const handleUpdateStatus = (id, currentStatus) => {
    setSelectedOrderId(id);
    setSelectedCurrentStatus(currentStatus || 'Pending');
    setStatusModalVisible(true);
  };

  const chooseStatus = async (status) => {
    if (!selectedOrderId || status === selectedCurrentStatus) {
      setStatusModalVisible(false);
      return;
    }

    const result = await dispatch(updateOrderStatus({ id: selectedOrderId, status }));
    if (!result.error) {
      setSelectedCurrentStatus(status);
      // Pull fresh list to keep cards in sync with backend immediately.
      dispatch(fetchAllOrders());
      if (selectedOrder?._id === selectedOrderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : prev));
      }
    }
    setStatusModalVisible(false);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailsModalVisible(true);
  };

  const handlePrintOrder = async (order) => {
    try {
      await printOrderReport(order);
    } catch (error) {
      Alert.alert('Print failed', error?.message || 'Unable to print order report right now.');
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('AdminDashboard');
  };

  const renderOrderActions = (item) => (
    <View style={styles.actionsRow}>
      <TouchableOpacity
        style={[styles.actionBtn, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
        onPress={() => handleUpdateStatus(item._id, item.status || item.orderStatus)}
      >
        <Text variant="bodySmall" weight="semiBold" color="primary">Change Status</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={() => handleViewDetails(item)}
      >
        <Text variant="bodySmall" weight="semiBold">View Details</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconActionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={() => handlePrintOrder(item)}
      >
        <MaterialCommunityIcons name="printer-outline" size={18} color={colors.primaryText} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <IconButton icon="arrow-left" color={colors.primaryText} onPress={handleBack} />
        <Text variant="h3" weight="bold">All Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.center} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.orderContainer}>
              <OrderCard order={item} onPress={() => handleViewDetails(item)} />
              {renderOrderActions(item)}
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setStatusModalVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text variant="h4" weight="semiBold">Update Status</Text>
            <Text variant="bodySmall" color="secondary" style={styles.modalSubtitle}>Select the next order status</Text>
            {statuses.map((status) => {
              const active = status === selectedCurrentStatus;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    { borderColor: colors.borderLight, backgroundColor: active ? colors.imageCard : 'transparent' },
                  ]}
                  onPress={() => chooseStatus(status)}
                >
                  <Text variant="body" weight={active ? 'bold' : 'regular'}>{status}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={detailsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.detailCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}> 
            <View style={styles.detailHeader}>
              <Text variant="h4" weight="semiBold">Order Details</Text>
              <IconButton icon="close" color={colors.primaryText} onPress={() => setDetailsModalVisible(false)} />
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
              <Text variant="bodySmall" color="secondary">Order ID</Text>
              <Text variant="body" style={styles.detailValue}>{selectedOrder?._id || '-'}</Text>

              <Text variant="bodySmall" color="secondary">Customer</Text>
              <Text variant="body" style={styles.detailValue}>{selectedOrder?.user?.name || '-'}</Text>

              <Text variant="bodySmall" color="secondary">Status</Text>
              <Text variant="body" style={styles.detailValue}>{selectedOrder?.status || selectedOrder?.orderStatus || 'Pending'}</Text>

              <Text variant="bodySmall" color="secondary">Total</Text>
              <Text variant="body" weight="bold" style={styles.detailValue}>{formatCurrency(selectedOrder?.totalPrice || 0)}</Text>

              <Text variant="bodySmall" color="secondary" style={{ marginTop: 8 }}>Items</Text>
              {(selectedOrder?.items || selectedOrder?.orderItems || []).map((item, idx) => (
                <View key={`${item.name}-${idx}`} style={styles.itemRow}>
                  <Text variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>{item.name}</Text>
                  <Text variant="bodySmall" color="secondary">x{item.quantity}</Text>
                  <Text variant="bodySmall" weight="semiBold">{formatCurrency((item.price || 0) * (item.quantity || 0))}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.detailActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Text variant="bodySmall" weight="semiBold">Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
                onPress={() => selectedOrder && handlePrintOrder(selectedOrder)}
              >
                <Text variant="bodySmall" weight="semiBold" color="primary">Print</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  orderContainer: {
    marginBottom: 8,
  },
  actionsRow: {
    marginTop: -4,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActionBtn: {
    width: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  modalSubtitle: {
    marginBottom: 4,
  },
  statusOption: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  detailCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    maxHeight: '85%',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailValue: {
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
});

export default OrderManagementScreen;
