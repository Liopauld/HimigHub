import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useDispatch, useSelector } from 'react-redux';
import { savePushToken } from '../redux/slices/authSlice';
import { navigateToOrderFromNotification } from '../utils/notificationNavigation';

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

let hasShownExpoGoPushWarning = false;

/**
 * usePushNotifications
 *
 * Registers the device for Expo push notifications, saves the token to the backend,
 * and returns refs to the notification + response listeners so callers can attach
 * navigation logic if needed.
 *
 * Usage:
 *   const { expoPushToken, notificationListener, responseListener } = usePushNotifications();
 */
const usePushNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  const expoPushTokenRef = useRef(null);
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    // Only register on a physical device
    if (!Device.isDevice) return;
    if (!user) return;
    if (isExpoGo) {
      if (!hasShownExpoGoPushWarning) {
        hasShownExpoGoPushWarning = true;
        if (__DEV__) {
          console.log('[PushNotifications] Remote push registration skipped in Expo Go (expected behavior).');
        }
      }
      return;
    }

    let cancelled = false;

    const registerPushToken = async () => {
      const NotificationsModule = await import('expo-notifications');
      const Notifications = NotificationsModule.default || NotificationsModule;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Check/request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[PushNotifications] Permission not granted.');
        return;
      }

      if (isExpoGo) {
        return;
      }

      // Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#AAEE44',
        });
      }

      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ||
          Constants?.easConfig?.projectId;

        if (!projectId) {
          console.warn('[PushNotifications] Missing EAS projectId. Push token registration skipped.');
          return;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        if (!cancelled) {
          expoPushTokenRef.current = tokenData.data;
          dispatch(savePushToken(tokenData.data));
        }
      } catch (err) {
        console.warn('[PushNotifications] Failed to get token:', err);
      }
    };

    registerPushToken();

    // Register listeners only when notification module is available.
    import('expo-notifications').then((NotificationsModule) => {
      const Notifications = NotificationsModule.default || NotificationsModule;
      if (cancelled) return;

      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log('[PushNotifications] received:', notification.request.content.title);
        },
      );

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data;
          console.log('[PushNotifications] response data:', data);
          if (data?.screen === 'OrderDetails' && data?.orderId) {
            navigateToOrderFromNotification(data.orderId);
          }
        },
      );
    });

    return () => {
      cancelled = true;
      if (notificationListener.current) {
        notificationListener.current.remove?.();
      }
      if (responseListener.current) {
        responseListener.current.remove?.();
      }
    };
  }, [user?._id]);

  return {
    expoPushToken: expoPushTokenRef.current,
    notificationListener,
    responseListener,
  };
};

export default usePushNotifications;
