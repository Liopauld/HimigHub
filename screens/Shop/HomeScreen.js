import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setFilters } from '../../redux/slices/productSlice';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import SearchInput from '../../components/inputs/SearchInput';
import ProductCard from '../../components/cards/ProductCard';
import FilterModal from '../../components/modals/FilterModal';
import IconButton from '../../components/buttons/IconButton';
import { useAppTheme } from '../../context/ThemeContext';
import { spacing, shadows } from '../../theme/spacing';
import SidebarContext from '../../navigation/SidebarContext';

const HomeScreen = ({ navigation }) => {
  const { colors } = useAppTheme();
  const { openSidebar } = useContext(SidebarContext);
  const dispatch = useDispatch();
  const { products, loading, filters } = useSelector((state) => state.product);
  const { items } = useSelector((state) => state.cart);

  const [search, setSearch] = useState(filters.search || '');
  const [filterVisible, setFilterVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch(setFilters({ search }));
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchProducts(filters)).finally(() => setRefreshing(false));
  }, [filters, dispatch]);

  const handleSearch = () => {
    dispatch(setFilters({ search }));
  };

  const handleApplyFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleOpenMenu = () => {
    if (typeof navigation.openDrawer === 'function') {
      navigation.openDrawer();
      return;
    }
    navigation.getParent?.()?.openDrawer?.();
    openSidebar?.();
  };

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerTop}>
          <IconButton icon="menu" onPress={handleOpenMenu} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Image source={require('../../assets/logo.png')} style={{ width: 28, height: 28, borderRadius: 6 }} resizeMode="cover" />
            <Text variant="h2" weight="bold" color="primary">HIMIGHUB</Text>
          </View>
          <View style={styles.cartButton}>
            <IconButton icon="cart-outline" onPress={() => navigation.navigate('Cart')} />
            {cartItemCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error, borderColor: colors.surface }]}>
                <Text variant="caption" weight="bold" color="light" style={styles.badgeText}>
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.searchContainer}>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            onSearch={handleSearch}
            placeholder="Search products..."
            filterIcon
            onFilterPress={() => setFilterVisible(true)}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.cardWrap}>
              <ProductCard
                product={item}
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
              />
            </View>
          )}
          contentContainerStyle={styles.list}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text variant="body" color="secondary">No products found.</Text>
            </View>
          }
        />
      )}

      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        currentFilters={filters}
        onApply={handleApplyFilters}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    ...shadows.xs,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cartButton: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: spacing.md,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  searchContainer: {
    marginBottom: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
});

export default HomeScreen;
