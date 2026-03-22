import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

/**
 * RatingStars — either read-only (display) or interactive (input).
 * Props:
 *   rating       number     current rating value (1–5)
 *   interactive  boolean    true → tappable star input
 *   onRate       function   called with new rating when interactive
 *   size         number     icon size (default 16)
 */
const RatingStars = ({ rating = 0, interactive = false, onRate, size = 16 }) => {
  const clampedRating = Math.round(Math.min(5, Math.max(0, rating)));

  return (
    <View style={styles.row}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < clampedRating;
        if (interactive) {
          return (
            <TouchableOpacity key={i} onPress={() => onRate && onRate(i + 1)} style={styles.starBtn}>
              <Ionicons
                name={filled ? 'star' : 'star-outline'}
                size={size}
                color={filled ? colors.accent : colors.border}
              />
            </TouchableOpacity>
          );
        }
        return (
          <Ionicons
            key={i}
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? '#FFD700' : colors.border}
            style={styles.starIcon}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  starBtn: { padding: 4 },
  starIcon: { marginHorizontal: 1 },
});

export default RatingStars;
