import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import AppButton from '../../components/common/AppButton';

const OrderSuccessScreen = ({ navigation, route }) => {
  const { orderId } = route.params || {};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={52} color={colors.primaryText} />
        </View>

        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.sub}>
          Your order has been placed successfully. We'll notify you when it's on the way.
        </Text>

        {orderId ? (
          <View style={styles.orderIdBox}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderId}>#{orderId.slice(-8).toUpperCase()}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <AppButton
            label="Track My Order"
            variant="lime"
            onPress={() => navigation.navigate('OrderHistory')}
          />
          <AppButton
            label="Continue Shopping"
            variant="outline"
            onPress={() => navigation.navigate('Home')}
            style={{ marginTop: 14 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 32,
    color: colors.primaryText,
    marginBottom: 12,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  orderIdBox: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 36,
  },
  orderIdLabel: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  orderId: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: colors.primaryText,
    letterSpacing: 2,
  },
  actions: { width: '100%' },
});

export default OrderSuccessScreen;
