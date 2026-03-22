import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, clearOrderState } from '../../redux/slices/orderSlice';
import { clearCart, removeItem } from '../../redux/slices/cartSlice';
import { clearCart as clearCartSQLite, deleteCartItem } from '../../db/sqlite';
import { getCurrentLocation } from '../../utils/geolocation';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import Input from '../../components/inputs/Input';
import Button from '../../components/buttons/Button';
import IconButton from '../../components/buttons/IconButton';
import { useAppTheme } from '../../context/ThemeContext';

const CheckoutScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.order);
  const { colors } = useAppTheme();

  const savedAddress = user?.address || {};
  const hasSavedAddress = Boolean(
    savedAddress.street?.trim() &&
    savedAddress.city?.trim() &&
    savedAddress.zip?.trim() &&
    savedAddress.country?.trim()
  );

  const [useSavedAddress, setUseSavedAddress] = useState(hasSavedAddress);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [phoneNo, setPhoneNo] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState('GCASH');
  const [gcashMobile, setGcashMobile] = useState(user?.phone || '');
  const [cardNumber, setCardNumber] = useState('');
  const [locatingAddress, setLocatingAddress] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const passedItems = route?.params?.selectedItems;
  const checkoutItems = Array.isArray(passedItems) && passedItems.length > 0 ? passedItems : items;
  const checkoutItemsTotal = checkoutItems.reduce(
    (sum, i) => sum + (Number(i?.price) || 0) * (Number(i?.quantity) || 0),
    0
  );

  const processSimulatedPayment = async () => {
    setPaymentProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPaymentProcessing(false);
  };
  const shippingPrice = 10;
  const grandTotal = checkoutItemsTotal + shippingPrice;

  const handleOrderSuccessNavigation = () => {
    const routeNames = navigation.getState?.()?.routeNames || [];
    if (routeNames.includes('OrderHistory')) {
      navigation.navigate('OrderHistory');
      return;
    }
    if (routeNames.includes('Home')) {
      navigation.navigate('Home');
      return;
    }
    navigation.popToTop?.();
  };

  const handleUseCurrentLocation = async () => {
    setLocatingAddress(true);
    try {
      const locationData = await getCurrentLocation();
      if (locationData) {
        setAddress(locationData.street || '');
        setCity(locationData.city || '');
        setPostalCode(locationData.zip || '');
        setCountry(locationData.country || '');
        Alert.alert('Success', 'Address autofilled from current location');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocatingAddress(false);
    }
  };

  const clearCheckedOutCart = async () => {
    const isPartialCheckout = Array.isArray(passedItems) && passedItems.length > 0 && passedItems.length < items.length;

    if (isPartialCheckout) {
      for (const item of passedItems) {
        dispatch(removeItem({ productId: item.productId, size: item.size }));
        await deleteCartItem(item.productId, item.size);
      }
    } else {
      dispatch(clearCart());
      await clearCartSQLite();
    }
  };

  const handleGoBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Cart');
  };

  const handlePlaceOrder = () => {
    const normalizedPhone = phoneNo.trim();
    const normalizedGcashMobile = gcashMobile.trim();
    const normalizedCardNumber = cardNumber.replace(/\s+/g, '').trim();

    const shippingAddressPayload = useSavedAddress
      ? {
          street: savedAddress.street,
          city: savedAddress.city,
          state: savedAddress.state || '',
          zip: savedAddress.zip,
          country: savedAddress.country,
          phoneNo: normalizedPhone,
        }
      : {
          street: address.trim(),
          city: city.trim(),
          state: '',
          zip: postalCode.trim(),
          country: country.trim(),
          phoneNo: normalizedPhone,
        };

    if (!shippingAddressPayload.street || !shippingAddressPayload.city || !shippingAddressPayload.zip || !shippingAddressPayload.country || !normalizedPhone) {
      Alert.alert('Error', 'Please complete shipping details and phone number');
      return;
    }

    if (paymentMethod === 'GCASH' && !normalizedGcashMobile) {
      Alert.alert('Error', 'Please provide your GCash mobile number');
      return;
    }

    if (paymentMethod === 'CARD' && normalizedCardNumber.length < 12) {
      Alert.alert('Error', 'Please provide a valid card number');
      return;
    }

    const normalizedItems = (checkoutItems || [])
      .map((i) => ({
        product: i.productId || i.product,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
        size: i.size || '',
      }))
      .filter((i) => i.product && i.quantity > 0);

    if (normalizedItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty. Please add items before checkout.');
      return;
    }

    const normalizedItemsPrice = normalizedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const orderData = {
      // Backend expects `items` and `shippingAddress`
      items: normalizedItems,
      shippingAddress: shippingAddressPayload,
      paymentMethod,
      paymentDetails:
        paymentMethod === 'GCASH'
          ? { mobileNumber: normalizedGcashMobile }
          : paymentMethod === 'CARD'
            ? { cardNumber: normalizedCardNumber }
            : {},
      itemsPrice: normalizedItemsPrice,
      shippingPrice,
      totalPrice: normalizedItemsPrice + shippingPrice,
    };

    dispatch(createOrder(orderData)).then(async (res) => {
      if (!res.error) {
        if (paymentMethod === 'GCASH' || paymentMethod === 'CARD') {
          await processSimulatedPayment();
        }

        await clearCheckedOutCart();
        dispatch(clearOrderState());
        Alert.alert('Success', paymentMethod === 'COD' ? 'Order placed successfully!' : 'Payment successful and order placed!', [
          {
            text: 'OK',
            onPress: handleOrderSuccessNavigation,
          }
        ]);
      } else {
        Alert.alert('Error', res.payload || 'Failed to place order');
      }
    });
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <IconButton icon="arrow-left" color={colors.primaryText} onPress={handleGoBack} />
        <Text variant="h3" weight="bold">Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>Shipping Information</Text>

        {hasSavedAddress && (
          <View style={styles.addressChoiceWrap}>
            <Button
              title="Use Saved Address"
              variant={useSavedAddress ? 'primary' : 'outline'}
              onPress={() => setUseSavedAddress(true)}
              style={styles.addressChoiceBtn}
            />
            <View style={{ width: 10 }} />
            <Button
              title="Use Different Address"
              variant={!useSavedAddress ? 'primary' : 'outline'}
              onPress={() => setUseSavedAddress(false)}
              style={styles.addressChoiceBtn}
            />
          </View>
        )}

        {!useSavedAddress ? (
          <>
            <Input label="Address" placeholder="Street Address" value={address} onChangeText={setAddress} />
            <Input label="City" placeholder="City" value={city} onChangeText={setCity} />
            <Input label="Postal Code" placeholder="Postal Code" value={postalCode} onChangeText={setPostalCode} keyboardType="numeric" />
            <Input label="Country" placeholder="Country" value={country} onChangeText={setCountry} />
            <View style={styles.useLocationContainer}>
              <Button
                title={locatingAddress ? "Getting Location..." : "Use Current Location"}
                variant="outline"
                onPress={handleUseCurrentLocation}
                disabled={locatingAddress}
                icon={locatingAddress ? undefined : "map-marker-outline"}
                iconPosition="left"
                fullWidth
              />
            </View>
          </>
        ) : null}
        
        <Input label="Phone Number" placeholder="Phone Number" value={phoneNo} onChangeText={setPhoneNo} keyboardType="phone-pad" />

        <Text variant="h4" weight="semiBold" style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.addressChoiceWrap}>
          <Button
            title="Pay via GCash"
            variant={paymentMethod === 'GCASH' ? 'primary' : 'outline'}
            onPress={() => setPaymentMethod('GCASH')}
            style={styles.addressChoiceBtn}
          />
          <View style={{ width: 10 }} />
          <Button
            title="Pay via Card"
            variant={paymentMethod === 'CARD' ? 'primary' : 'outline'}
            onPress={() => setPaymentMethod('CARD')}
            style={styles.addressChoiceBtn}
          />
        </View>
        <View style={styles.addressChoiceWrap}>
          <Button
            title="Cash on Delivery"
            variant={paymentMethod === 'COD' ? 'primary' : 'outline'}
            onPress={() => setPaymentMethod('COD')}
            style={styles.addressChoiceBtn}
          />
        </View>
        {paymentMethod === 'GCASH' ? (
          <Input
            label="GCash Mobile Number"
            placeholder="09XXXXXXXXX"
            value={gcashMobile}
            onChangeText={setGcashMobile}
            keyboardType="phone-pad"
          />
        ) : null}
        {paymentMethod === 'CARD' ? (
          <Input
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="number-pad"
          />
        ) : null}
        {(paymentMethod === 'GCASH' || paymentMethod === 'CARD') ? (
          <Text variant="bodySmall" color="secondary" style={styles.paymentHint}>
            Simulated gateway flow: payment details are collected and payment is marked as paid for testing.
          </Text>
        ) : null}

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
        <View style={styles.summaryRow}>
          <Text variant="body" color="secondary">Items Total:</Text>
          <Text variant="body" weight="semiBold">${checkoutItemsTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text variant="body" color="secondary">Shipping:</Text>
          <Text variant="body" weight="semiBold">${shippingPrice.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.grandTotalRow, { borderTopColor: colors.borderLight }]}>
          <Text variant="body" weight="bold">Grand Total:</Text>
          <Text variant="h3" weight="bold" color="primary">${grandTotal.toFixed(2)}</Text>
        </View>

        <Button 
          title="Place Order" 
          onPress={handlePlaceOrder} 
          loading={loading || paymentProcessing}
          disabled={checkoutItems.length === 0}
        />
      </View>
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
    padding: 24,
  },
  sectionTitle: {
    marginBottom: 20,
  },
  addressChoiceWrap: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addressChoiceBtn: {
    flex: 1,
  },
  savedAddressCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  useLocationContainer: {
    marginBottom: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  paymentHint: {
    marginTop: -8,
    marginBottom: 12,
  }
});

export default CheckoutScreen;
