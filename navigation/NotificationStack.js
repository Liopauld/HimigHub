import React, { useContext, useEffect, useState, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationDetailScreen from '../screens/Notifications/NotificationDetailScreen';

// Placeholder list screen — notifications are rendered inside a simple list
// until a dedicated NotificationListScreen is built.
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SidebarContext from './SidebarContext';
import { useAppTheme } from '../context/ThemeContext';
import api from '../redux/api/axiosConfig';

const NotificationListScreen = ({ navigation }) => {
  // NOTE: Replace with a Redux-connected list when backend notifications are wired up.
  const { openSidebar } = useContext(SidebarContext);
  const { colors } = useAppTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.data?.notifications || []);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleOpenMenu = () => {
    if (typeof navigation.openDrawer === 'function') {
      navigation.openDrawer();
      return;
    }
    navigation.getParent?.()?.openDrawer?.();
    openSidebar?.();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleOpenMenu} style={styles.menuBtn}>
          <Ionicons name="menu-outline" size={26} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primaryText }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.empty}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item._id}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifications} colors={[colors.primary]} />}
            contentContainerStyle={notifications.length === 0 ? styles.emptyState : undefined}
            ListEmptyComponent={
              <>
                <Ionicons name="notifications-off-outline" size={64} color={colors.secondaryText} />
                <Text style={[styles.emptyText, { color: colors.secondaryText }]}>No notifications yet</Text>
              </>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                onPress={() => navigation.navigate('NotificationDetail', { notification: item })}
              >
                <Ionicons name="notifications-outline" size={22} color={colors.primary} />
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, { color: colors.primaryText }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.rowBody, { color: colors.secondaryText }]} numberOfLines={2}>{item.body}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  menuBtn: { padding: 4 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
  },
  empty: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  emptyState: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: 'Syne_700Bold', fontSize: 15, marginBottom: 4 },
  rowBody: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 18 },
});

const Stack = createNativeStackNavigator();

const NotificationStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotificationList" component={NotificationListScreen} />
      <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />
    </Stack.Navigator>
  );
};

export default NotificationStack;
