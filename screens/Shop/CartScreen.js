import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeItem, updateQuantity, clearCart } from '../../redux/slices/cartSlice';
import { clearCart as clearCartSQLite, deleteCartItem, updateCartItem } from '../../db/sqlite';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import Button from '../../components/buttons/Button';
import IconButton from '../../components/buttons/IconButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { BASE_URL } from '../../redux/api/axiosConfig';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector(state => state.cart);
  const { colors } = useAppTheme();
  const [selectedMap, setSelectedMap] = useState({});

  const getItemKey = (item) => `${item.productId}__${item.size || ''}`;

  useEffect(() => {
    setSelectedMap((prev) => {
      const next = {};
      for (const item of items) {
        const key = getItemKey(item);
        next[key] = prev[key] !== undefined ? prev[key] : true;
      }
      return next;
    });
  }, [items]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedMap[getItemKey(item)]),
    [items, selectedMap]
  );

  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const handleGoBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  const handleUpdateQty = async (productId, size, newQty, stock) => {
    if (newQty < 1) return;
    if (newQty > stock) {
      Alert.alert('Stock Limit', 'Cannot add more of this item.');
      return;
    }
    dispatch(updateQuantity({ productId, size, quantity: newQty }));
    await updateCartItem(productId, size, newQty);
  };

  const handleRemove = async (productId, size) => {
    dispatch(removeItem({ productId, size }));
    await deleteCartItem(productId, size);
    setSelectedMap((prev) => {
      const next = { ...prev };
      delete next[`${productId}__${size || ''}`];
      return next;
    });
  };

  const renderItem = ({ item }) => {
    const imageUrl = item.image?.startsWith('http') ? item.image : `${BASE_URL.replace('/api', '')}${item.image}`;
    
    return (
      <View style={[styles.cartItem, { backgroundColor: colors.imageCard }]}>
        <TouchableOpacity
          style={styles.checkboxWrap}
          onPress={() => {
            const key = getItemKey(item);
            setSelectedMap((prev) => ({ ...prev, [key]: !prev[key] }));
          }}
        >
          <MaterialCommunityIcons
            name={selectedMap[getItemKey(item)] ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={selectedMap[getItemKey(item)] ? colors.primary : colors.secondaryText}
          />
        </TouchableOpacity>
        <Image source={{ uri: imageUrl || 'https://via.placeholder.com/100' }} style={[styles.image, { backgroundColor: colors.surface }]} />
        <View style={styles.itemDetails}>
          <Text variant="body" weight="semiBold" numberOfLines={1}>{item.name}</Text>
          <Text variant="bodySmall" color="primary" weight="bold" style={styles.price}>
            {formatCurrency(item.price)}
          </Text>
          <View style={styles.controlsRow}>
            <View style={[styles.qtyContainer, { backgroundColor: colors.surface }]}>
              <TouchableOpacity onPress={() => handleUpdateQty(item.productId, item.size, item.quantity - 1, item.stock)} style={styles.qtyBtn}>
                <Text variant="h4">-</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: colors.primaryText }]}>{item.quantity}</Text>
              <TouchableOpacity onPress={() => handleUpdateQty(item.productId, item.size, item.quantity + 1, item.stock)} style={styles.qtyBtn}>
                <Text variant="h4">+</Text>
              </TouchableOpacity>
            </View>
            <IconButton 
              icon="delete-outline" 
              color={colors.error} 
              onPress={() => handleRemove(item.productId, item.size)} 
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <IconButton icon="arrow-left" onPress={handleGoBack} />
        <Text variant="h3" weight="bold">Shopping Cart</Text>
        <IconButton 
          icon="trash-can-outline" 
          color={colors.error} 
          onPress={async () => {
            dispatch(clearCart());
            await clearCartSQLite();
          }}
          disabled={items.length === 0}
        />
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="h3" color="secondary" style={styles.emptyText}>Your cart is empty.</Text>
          <Button title="Continue Shopping" onPress={() => navigation.navigate('Home')} />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item, index) => `${item.productId}-${item.size || 'default'}-${index}`}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
          />
          <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
            <View style={styles.summaryRow}>
              <Text variant="body" color="secondary">Selected Total</Text>
              <Text variant="h3" weight="bold" color="primary">{formatCurrency(selectedTotal)}</Text>
            </View>
            <Button 
              title={`Checkout (${selectedItems.length})`}
              onPress={() => navigation.navigate('Checkout', { selectedItems })}
              disabled={selectedItems.length === 0}
            />
          </View>
        </>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginBottom: 24,
  },
  list: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  checkboxWrap: {
    marginRight: 8,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  price: {
    marginVertical: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtn: {
    paddingHorizontal: 8,
  },
  qtyText: {
    marginHorizontal: 12,
    fontFamily: 'DMSans-Bold',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  }
});

export default CartScreen;
