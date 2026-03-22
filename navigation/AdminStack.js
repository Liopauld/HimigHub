import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/Admin/AdminDashboardScreen';
import ProductManagementScreen from '../screens/Admin/ProductManagementScreen';
import OrderManagementScreen from '../screens/Admin/OrderManagementScreen';
import ProductFormScreen from '../screens/Admin/ProductFormScreen';
import ManagePromotionsScreen from '../screens/Admin/ManagePromotionsScreen';
import AdminUsersScreen from '../screens/Admin/AdminUsersScreen';
import AdminAnalyticsScreen from '../screens/Admin/AdminAnalyticsScreen';

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
      <Stack.Screen name="OrderManagement" component={OrderManagementScreen} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} />
      <Stack.Screen name="ManagePromotions" component={ManagePromotionsScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
    </Stack.Navigator>
  );
};

export default AdminStack;
