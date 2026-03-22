import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../typography/Text';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const OrderCard = ({ order, onPress }) => {
  const { colors } = useAppTheme();
  const status = order.status || order.orderStatus || 'Pending';
  const orderItems = order.items || order.orderItems || [];

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'timer-sand';
      case 'Confirmed': return 'check-decagram-outline';
      case 'Preparing': return 'package-variant-closed';
      case 'Out for Delivery': return 'truck-delivery';
      case 'Delivered': return 'check-circle';
      case 'Cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const totalItems = orderItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <TouchableOpacity style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight, shadowColor: colors.shadowDefault }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.idContainer}>
          <MaterialCommunityIcons name="receipt" size={20} color={colors.primary} />
          <Text variant="bodySmall" weight="bold" color="primary" style={styles.idText}>
            Order #{order._id.substring(order._id.length - 8).toUpperCase()}
          </Text>
        </View>
        <Text variant="caption" color="secondary">
          {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text variant="bodySmall" color="secondary">Items:</Text>
          <Text variant="body" weight="semiBold" color="primaryText">{totalItems}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text variant="bodySmall" color="secondary">Total Amount:</Text>
          <Text variant="body" weight="bold" color="primary">{formatCurrency(order.totalPrice)}</Text>
        </View>
      </View>

      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
        <MaterialCommunityIcons name={getStatusIcon(status)} size={16} color={getStatusColor(status)} />
        <Text variant="bodySmall" weight="semiBold" style={{ color: getStatusColor(status), marginLeft: 6 }}>
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idText: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  content: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
  }
});

export default OrderCard;
