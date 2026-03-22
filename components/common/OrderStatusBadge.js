import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

const STATUS_CONFIG = {
  Pending:           { bg: '#E5E7EB', text: '#374151' },
  Processing:        { bg: '#E5E7EB', text: '#374151' },
  Confirmed:         { bg: '#DBEAFE', text: '#1D4ED8' },
  Preparing:         { bg: '#FEF3C7', text: '#D97706' },
  'Out for Delivery':{ bg: '#EDE9FE', text: '#7C3AED' },
  Shipped:           { bg: '#EDE9FE', text: '#7C3AED' },
  Delivered:         { bg: '#D1FAE5', text: '#065F46' },
  Cancelled:         { bg: '#FEE2E2', text: '#B91C1C' },
};

const OrderStatusBadge = ({ status, style }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <Text style={[styles.label, { color: config.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
});

export default OrderStatusBadge;
