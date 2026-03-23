import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../redux/slices/productSlice';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import IconButton from '../../components/buttons/IconButton';
import Button from '../../components/buttons/Button';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { BASE_URL } from '../../redux/api/axiosConfig';
import { notifyError, notifySuccess } from '../../utils/appNotifier';

const ProductManagementScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.product);
  const { colors } = useAppTheme();

  useEffect(() => {
    dispatch(fetchProducts())
      .unwrap()
      .catch((err) => {
        notifyError('Products Load Failed', String(err || 'Failed to fetch products.'));
      });
  }, [dispatch]);

  const handleDelete = (id) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteProduct(id)).unwrap();
            notifySuccess('Product Deleted', 'Product has been removed from the catalog.');
          } catch (err) {
            notifyError('Delete Failed', String(err || 'Unable to delete product.'));
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const imageUrl = item.images?.length > 0 ? (item.images[0].startsWith('http') ? item.images[0] : `${BASE_URL.replace('/api', '')}${item.images[0]}`) : 'https://via.placeholder.com/50';

    return (
      <View style={[styles.itemContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <Image source={{ uri: imageUrl }} style={[styles.image, { backgroundColor: colors.imageCard }]} />
        <View style={styles.info}>
          <Text variant="bodySmall" weight="semiBold" numberOfLines={1} style={{ color: colors.primaryText }}>{item.name}</Text>
          <Text variant="caption" color="secondary">{formatCurrency(item.price)} - Stock: {item.stock}</Text>
        </View>
        <View style={styles.actions}>
          <IconButton
            icon="pencil"
            color={colors.primary}
            onPress={() => navigation.navigate('ProductForm', { productId: item._id })}
          />
          <IconButton icon="delete" color={colors.error} onPress={() => handleDelete(item._id)} />
        </View>
      </View>
    );
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <IconButton icon="arrow-left" color={colors.primaryText} onPress={() => navigation.goBack()} />
        <Text variant="h3" weight="bold">Products</Text>
        <IconButton
          icon="plus"
          color={colors.primary}
          onPress={() => navigation.navigate('ProductForm')}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.center} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  list: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
  }
});

export default ProductManagementScreen;
