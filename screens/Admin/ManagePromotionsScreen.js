import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  Switch,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../redux/api/axiosConfig';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { useAppTheme } from '../../context/ThemeContext';

const EMPTY_PROMO = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  minOrderAmount: '',
  usageLimit: '',
  expiresAt: '',
  isActive: true,
};

const ManagePromotionsScreen = ({ navigation }) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [form, setForm] = useState(EMPTY_PROMO);

  const loadPromotions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/promotions');
      setPromotions(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load promotions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const openCreate = () => {
    setEditingPromo(null);
    setForm(EMPTY_PROMO);
    setModalVisible(true);
  };

  const openEdit = (promo) => {
    setEditingPromo(promo);
    setForm({
      code: promo.code || '',
      discountType: promo.discountType || 'percent',
      discountValue: String(promo.discountValue || ''),
      minOrderAmount: String(promo.minOrderAmount || ''),
      usageLimit: String(promo.usageLimit || ''),
      expiresAt: promo.expiresAt ? promo.expiresAt.split('T')[0] : '',
      isActive: promo.isActive ?? true,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.discountValue) {
      Alert.alert('Missing fields', 'Code and discount value are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : 0,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : null,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      };
      if (editingPromo) {
        await api.put(`/promotions/${editingPromo._id}`, payload);
      } else {
        await api.post('/promotions', payload);
      }
      setModalVisible(false);
      loadPromotions();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save promotion.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (promoId) => {
    Alert.alert('Delete Promotion', 'Are you sure you want to delete this promotion?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/promotions/${promoId}`);
            loadPromotions();
          } catch {
            Alert.alert('Error', 'Failed to delete promotion.');
          }
        },
      },
    ]);
  };

  const renderPromo = ({ item }) => (
    <View style={styles.promoCard}>
      <View style={styles.promoHeader}>
        <View style={styles.codeBox}>
          <Text style={styles.code}>{item.code}</Text>
        </View>
        <View style={[styles.activeBadge, !item.isActive && styles.inactiveBadge]}>
          <Text style={[styles.activeBadgeText, !item.isActive && styles.inactiveBadgeText]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <Text style={styles.promoDetail}>
        Discount: {item.discountType === 'percent' ? `${item.discountValue}%` : `₱${item.discountValue}`}
      </Text>
      {item.minOrderAmount > 0 && (
        <Text style={styles.promoDetail}>Min. order: ₱{item.minOrderAmount}</Text>
      )}
      {item.expiresAt && (
        <Text style={styles.promoDetail}>
          Expires: {new Date(item.expiresAt).toLocaleDateString()}
        </Text>
      )}
      <Text style={styles.promoDetail}>
        Used: {item.usedCount || 0}/{item.usageLimit || '∞'}
      </Text>

      <View style={styles.promoActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Ionicons name="pencil" size={16} color={colors.selectedChip} />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item._id)}>
          <Ionicons name="trash-outline" size={16} color="#E63B2E" />
          <Text style={styles.delBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {loading && <LoadingOverlay message="Loading..." />}

      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 0 : 16 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={24} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={promotions}
        keyExtractor={(item) => item._id}
        renderItem={renderPromo}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="pricetag-outline" size={48} color={colors.secondaryText} />
              <Text style={styles.emptyText}>No promotions yet</Text>
            </View>
          ) : null
        }
      />

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={26} color={colors.primaryText} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPromo ? 'Edit Promotion' : 'New Promotion'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
            {[
              { label: 'Promo Code', key: 'code', placeholder: 'SUMMER20', auto: 'characters' },
              { label: 'Discount Value', key: 'discountValue', placeholder: '20', keyboard: 'numeric' },
              { label: 'Min. Order Amount (₱)', key: 'minOrderAmount', placeholder: '0', keyboard: 'numeric' },
              { label: 'Usage Limit', key: 'usageLimit', placeholder: 'Leave empty for unlimited', keyboard: 'numeric' },
              { label: 'Expiry Date (YYYY-MM-DD)', key: 'expiresAt', placeholder: '2025-12-31' },
            ].map((field) => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{field.label}</Text>
                <TextInput
                  style={styles.inputBox}
                  value={form[field.key]}
                  onChangeText={(val) => setForm((p) => ({ ...p, [field.key]: val }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.secondaryText}
                  keyboardType={field.keyboard || 'default'}
                  autoCapitalize={field.auto || 'none'}
                />
              </View>
            ))}

            {/* Discount Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Discount Type</Text>
              <View style={styles.typeRow}>
                {['percent', 'flat'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, form.discountType === t && styles.typeChipSelected]}
                    onPress={() => setForm((p) => ({ ...p, discountType: t }))}
                  >
                    <Text
                      style={[styles.typeChipText, form.discountType === t && styles.typeChipTextSelected]}
                    >
                      {t === 'percent' ? '% Percent' : '₱ Flat amount'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Active toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Active</Text>
              <Switch
                value={form.isActive}
                onValueChange={(val) => setForm((p) => ({ ...p, isActive: val }))}
                trackColor={{ false: '#D0D0D0', true: colors.accent }}
                thumbColor="#FFF"
              />
            </View>

            <View style={styles.saveBtn}>
              <AppButton
                label={editingPromo ? 'Save Changes' : 'Create Promotion'}
                variant="lime"
                onPress={handleSave}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    color: colors.primaryText,
  },
  addBtn: { padding: 4 },
  list: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  promoCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: colors.imageCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  code: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: colors.primaryText,
    letterSpacing: 2,
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inactiveBadge: { backgroundColor: '#F3F4F6' },
  activeBadgeText: { fontFamily: 'DMSans_700Bold', fontSize: 12, color: '#065F46' },
  inactiveBadgeText: { color: '#9CA3AF' },
  promoDetail: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  promoActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editBtnText: { fontFamily: 'DMSans_700Bold', fontSize: 13, color: colors.selectedChip },
  delBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  delBtnText: { fontFamily: 'DMSans_700Bold', fontSize: 13, color: '#E63B2E' },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 16 },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: colors.secondaryText },

  /* Modal */
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Syne_700Bold',
    fontSize: 20,
    color: colors.primaryText,
  },
  modalScroll: { paddingHorizontal: 24, paddingBottom: 50 },
  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: colors.imageCard,
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 50,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: colors.primaryText,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: {
    flex: 1,
    backgroundColor: colors.imageCard,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  typeChipSelected: { backgroundColor: colors.primaryText, borderColor: colors.primaryText },
  typeChipText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: colors.primaryText },
  typeChipTextSelected: { fontFamily: 'DMSans_700Bold', color: '#FFF' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.imageCard,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 16,
  },
  toggleLabel: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: colors.primaryText },
  saveBtn: { marginTop: 8 },
});

export default ManagePromotionsScreen;
