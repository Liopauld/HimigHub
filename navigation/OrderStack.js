import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CheckoutScreen from '../screens/Order/CheckoutScreen';
import OrderHistoryScreen from '../screens/Order/OrderHistoryScreen';
import OrderDetailsScreen from '../screens/Order/OrderDetailsScreen';
import OrderSuccessScreen from '../screens/Order/OrderSuccessScreen';

const Stack = createNativeStackNavigator();

const OrderStack = ({ initialOrderId }) => {
  const initialRouteName = initialOrderId ? 'OrderDetails' : 'OrderHistory';

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        initialParams={initialOrderId ? { id: initialOrderId } : undefined}
      />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
    </Stack.Navigator>
  );
};

export default OrderStack;
