import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeNotifier } from '../../utils/appNotifier';

const DISPLAY_MS = 3200;

const GlobalToast = () => {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(null);
  const [queue, setQueue] = useState([]);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    const unsubscribe = subscribeNotifier((payload) => {
      setQueue((prev) => [...prev, payload]);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (active || queue.length === 0) return;
    setActive(queue[0]);
    setQueue((prev) => prev.slice(1));
  }, [active, queue]);

  useEffect(() => {
    if (!active) return undefined;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setActive(null);
      });
    }, DISPLAY_MS);

    return () => clearTimeout(hideTimer);
  }, [active, opacity, translateY]);

  const toastStyle = useMemo(() => {
    if (!active) return styles.info;
    if (active.type === 'success') return styles.success;
    if (active.type === 'error') return styles.error;
    return styles.info;
  }, [active]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={[styles.wrapper, { top: Math.max(insets.top, 10) + 6 }]}> 
      <Animated.View style={[styles.container, toastStyle, { opacity, transform: [{ translateY }] }]}> 
        <Text numberOfLines={1} style={styles.title}>{active.title}</Text>
        {!!active.message && <Text numberOfLines={3} style={styles.message}>{String(active.message)}</Text>}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 9999,
  },
  container: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  message: {
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.96,
  },
  success: {
    backgroundColor: '#1E7E34',
    borderColor: '#2AA64A',
  },
  error: {
    backgroundColor: '#B42318',
    borderColor: '#D6453D',
  },
  info: {
    backgroundColor: '#155EEF',
    borderColor: '#3B82F6',
  },
});

export default GlobalToast;
