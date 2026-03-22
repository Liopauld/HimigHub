import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchProducts, setFilters, clearFilters } from '../../redux/slices/productSlice';
import ProductCard from '../../components/common/ProductCard';
import SearchAutocompleteInput from '../../components/inputs/SearchAutocompleteInput';
import { useAppTheme } from '../../context/ThemeContext';
import { useSearchAutocomplete } from '../../hooks/useSearchAutocomplete';

const ProductListScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { products, loading, loadingMore, filters, pagination, hasNextPage } = useSelector((s) => s.product);
  const { colors } = useAppTheme();
  const styles = getStyles(colors);

  const [search, setSearch] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'All');
  const { suggestions } = useSearchAutocomplete(search, products);

  const category = route?.params?.category || 'All';

  const handleBack = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !loadingMore && !loading && pagination.page < pagination.pages) {
      dispatch(fetchProducts({
        ...filters,
        category: selectedCategory !== 'All' ? selectedCategory : '',
        search,
        page: pagination.page + 1,
      }));
    }
  }, [hasNextPage, loadingMore, loading, pagination, filters, selectedCategory, search, dispatch]);

  const categories = ['All', 'Wind', 'String', 'Percussion', 'Accessories'];

  useEffect(() => {
    dispatch(fetchProducts({ ...filters, category: category !== 'All' ? category : '' }));
    setSelectedCategory(category);
  }, [category]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const newFilters = {
        ...filters,
        category: selectedCategory !== 'All' ? selectedCategory : '',
        search,
      };
      dispatch(setFilters(newFilters));
      dispatch(fetchProducts(newFilters));
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, selectedCategory, dispatch]);

  const handleCategoryPress = (cat) => {
    setSelectedCategory(cat);
    const newFilters = { ...filters, category: cat !== 'All' ? cat : '' };
    dispatch(setFilters(newFilters));
    dispatch(fetchProducts(newFilters));
  };

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {selectedCategory !== 'All' ? selectedCategory : 'All Products'}
        </Text>
        <TouchableOpacity onPress={() => dispatch(clearFilters())} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <SearchAutocompleteInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          suggestions={suggestions}
          onSuggestionSelect={(suggestion) => {
            setSearch(suggestion.name);
            const newFilters = {
              ...filters,
              category: selectedCategory !== 'All' ? selectedCategory : '',
              search: suggestion.name,
            };
            dispatch(setFilters(newFilters));
            dispatch(fetchProducts(newFilters));
          }}
          onClear={() => setSearch('')}
        />
      </View>

      {/* Category Chips */}
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          scrollEnabled
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(cat) => cat}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                selectedCategory === cat && styles.chipSelected,
              ]}
              onPress={() => handleCategoryPress(cat)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === cat && styles.chipTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        />
      </View>

      {/* Product Grid */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={48} color={colors.secondaryText} />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          renderItem={renderProduct}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (pagination.page < pagination.pages && !loading) {
              dispatch(fetchProducts({
                ...filters,
                category: selectedCategory !== 'All' ? selectedCategory : '',
                search,
                page: pagination.page + 1,
              }));
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.accent} />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const getStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  title: {
    flex: 1,
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    color: colors.primaryText,
    textAlign: 'center',
  },
  clearBtn: { padding: 4 },
  clearText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: colors.selectedChip,
  },
  searchRow: { paddingHorizontal: 20, marginBottom: 12 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 50,
    paddingHorizontal: 16,
    height: 46,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.primaryText,
  },
  categoryRow: { marginBottom: 8 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipSelected: {
    backgroundColor: colors.selectedChip,
    borderColor: colors.selectedChip,
  },
  chipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.primaryText,
  },
  chipTextSelected: {
    fontFamily: 'DMSans_700Bold',
    color: colors.background, // If selectedChip is light in dark mode, text should be dark. Best to use the background color which contrasts.
  },
  grid: { paddingHorizontal: 14, paddingBottom: 40 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: colors.secondaryText,
  },
});

export default ProductListScreen;
