import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import RatingStars from './RatingStars';
import { useAppTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const ReviewCard = ({ review, canEdit = false, onEdit }) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const reviewerName = review?.name || review?.user?.name || 'User';
  const initial = reviewerName.charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{reviewerName}</Text>
          <RatingStars rating={review.rating} size={14} />
        </View>
        <View style={styles.metaColumn}>
          <Text style={styles.date}>
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
          </Text>
          {canEdit && (
            <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
              <Ionicons name="create-outline" size={14} color={colors.primary} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight, // Use dynamic border instead of #F0F0F0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.imageCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: colors.primaryText,
  },
  userInfo: {
    flex: 1,
  },
  metaColumn: {
    alignItems: 'flex-end',
  },
  name: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: colors.primaryText,
    marginBottom: 4,
  },
  date: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: colors.secondaryText,
  },
  editBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: colors.primary,
  },
  comment: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.primaryText,
    lineHeight: 22,
  },
});

export default ReviewCard;
