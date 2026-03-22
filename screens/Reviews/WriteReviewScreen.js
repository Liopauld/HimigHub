import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { createReview, updateReview } from '../../redux/slices/reviewSlice';
import RatingStars from '../../components/common/RatingStars';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { useAppTheme } from '../../context/ThemeContext';
import { hasBadWords, getCleanText } from '../../utils/badWordsFilter';

const WriteReviewScreen = ({ navigation, route }) => {
  const { colors } = useAppTheme();
  const { productId, productName, orderId, review } = route.params || {};
  const dispatch = useDispatch();
  const isEditMode = Boolean(review?._id);

  const handleBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  const [rating, setRating] = useState(Number(review?.rating) || 0);
  const [comment, setComment] = useState(review?.comment || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating.');
      return;
    }
    if (comment.trim().length < 10) {
      Alert.alert('Comment too short', 'Please write at least 10 characters.');
      return;
    }

    // Check for inappropriate content
    if (hasBadWords(comment)) {
      Alert.alert(
        'Language Policy',
        'Your review contains inappropriate language. Please revise and try again.'
      );
      return;
    }

    const cleanComment = getCleanText(comment.trim());

    setLoading(true);
    try {
      if (isEditMode) {
        await dispatch(updateReview({ id: review._id, data: { rating, comment: cleanComment } })).unwrap();
        Alert.alert('Updated', 'Your review has been updated.');
      } else {
        await dispatch(createReview({ productId, orderId, rating, comment: cleanComment })).unwrap();
        Alert.alert('Thank you!', 'Your review has been submitted.');
      }
      handleBack();
    } catch (err) {
      Alert.alert('Error', err || (isEditMode ? 'Failed to update review.' : 'Failed to submit review.'));
    } finally {
      setLoading(false);
    }
  };

  const styles = React.useMemo(() => StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    backBtn: { padding: 8 },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontFamily: 'Syne_700Bold',
      fontSize: 22,
      color: colors.primaryText,
    },
    scroll: { paddingHorizontal: 24, paddingBottom: 50 },
    productName: {
      fontFamily: 'Syne_700Bold',
      fontSize: 20,
      color: colors.primaryText,
      marginBottom: 24,
      marginTop: 12,
      textAlign: 'center',
    },
    ratingSection: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 32,
      marginBottom: 24,
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    ratingLabel: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 16,
      color: colors.primaryText,
      marginBottom: 20,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    ratingNote: {
      marginTop: 16,
      fontFamily: 'DMSans_500Medium',
      fontSize: 15,
      color: colors.secondaryText,
    },
    commentSection: { marginBottom: 32 },
    label: {
      fontFamily: 'DMSans_700Bold',
      fontSize: 13,
      color: colors.secondaryText,
      marginBottom: 8,
      marginLeft: 4,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    commentInput: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      fontFamily: 'DMSans_400Regular',
      fontSize: 16,
      color: colors.primaryText,
      height: 160,
      borderWidth: 1,
      borderColor: colors.border || '#EBEBEB',
    },
    charCount: {
      textAlign: 'right',
      marginTop: 8,
      fontFamily: 'DMSans_400Regular',
      fontSize: 12,
      color: colors.secondaryText,
    },
    submitBtn: { marginTop: 16 },
  }), [colors]);

  return (
    <SafeAreaView style={styles.safe}>
      {loading && <LoadingOverlay message="Submitting..." />}

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 0 : 16 }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditMode ? 'Edit Review' : 'Write a Review'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {productName && (
            <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
          )}

          {/* Star Rating Selector */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Your Rating</Text>
            <RatingStars
              rating={rating}
              interactive
              onRate={setRating}
              size={48}
            />
            <Text style={styles.ratingNote}>
              {rating === 0
                ? 'Tap a star to rate'
                : ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
            </Text>
          </View>

          {/* Comment */}
          <View style={styles.commentSection}>
            <Text style={styles.label}>Your Review</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience with this product..."
              placeholderTextColor={colors.secondaryText}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{comment.length}/500</Text>
          </View>

          <View style={styles.submitBtn}>
            <AppButton label={isEditMode ? 'Update Review' : 'Submit Review'} variant="primary" onPress={handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WriteReviewScreen;
