import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Text from '../typography/Text';
import { useAppTheme } from '../../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ReviewCard = ({ review }) => {
  const { colors } = useAppTheme();
  
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <MaterialCommunityIcons 
        key={i} 
        name={i < rating ? "star" : "star-outline"} 
        size={16} 
        color="#FFD700" 
      />
    ));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={styles.header}>
        <View style={styles.userContainer}>
          <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
            <Text variant="h4" weight="bold" color="primary">
              {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text variant="body" weight="semiBold" color="primaryText">{review.name}</Text>
            <View style={styles.starsContainer}>
              {renderStars(review.rating)}
            </View>
          </View>
        </View>
        <Text variant="caption" color="secondary">
          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
        </Text>
      </View>
      <Text variant="body" style={[styles.comment, { color: colors.secondaryText }]}>{review.comment}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userInfo: {
    justifyContent: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  comment: {
    lineHeight: 22,
  },
});

export default ReviewCard;
