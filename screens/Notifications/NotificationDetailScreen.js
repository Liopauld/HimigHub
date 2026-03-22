import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

const NotificationDetailScreen = ({ navigation, route }) => {
  const { notification } = route.params || {};
  const { colors } = useAppTheme();

  const handleBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('NotificationList');
  };

  if (!notification) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.secondaryText} />
          <Text style={[styles.noData, { color: colors.secondaryText }]}>Notification not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const typeIconMap = {
    order:      { icon: 'receipt-outline',         color: '#1D4ED8' },
    promo:      { icon: 'pricetag-outline',         color: '#D97706' },
    system:     { icon: 'information-circle-outline', color: '#374151' },
    delivery:   { icon: 'car-outline',              color: '#7C3AED' },
  };
  const typeInfo = typeIconMap[notification.type] || typeIconMap.system;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 0 : 16 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>Notification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Icon circle */}
        <View style={styles.iconWrapper}>
          <View style={[styles.iconCircle, { backgroundColor: typeInfo.color + '20' }]}>
            <Ionicons name={typeInfo.icon} size={40} color={typeInfo.color} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.primaryText }]}>{notification.title}</Text>
        <Text style={[styles.body, { color: colors.secondaryText }]}>{notification.body}</Text>

        {notification.createdAt && (
          <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
            {new Date(notification.createdAt).toLocaleString()}
          </Text>
        )}

        {notification.data && Object.keys(notification.data).length > 0 && (
          <View style={[styles.metaCard, { backgroundColor: colors.surface }]}>
            {Object.entries(notification.data).map(([key, val]) => (
              <View key={key} style={[styles.metaRow, { borderBottomColor: colors.borderLight }]}>
                <Text style={[styles.metaKey, { color: colors.secondaryText }]}>{key}</Text>
                <Text style={[styles.metaVal, { color: colors.primaryText }]}>{String(val)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noData: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
  },
  scroll: { paddingHorizontal: 24, paddingBottom: 50 },
  iconWrapper: { alignItems: 'center', marginVertical: 32 },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 20,
  },
  timestamp: {
    fontFamily: 'NunitoSans_400Regular',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  metaCard: {
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  metaKey: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  metaVal: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    maxWidth: '60%',
    textAlign: 'right',
  },
});

export default NotificationDetailScreen;
