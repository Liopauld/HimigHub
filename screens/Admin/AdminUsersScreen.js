import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import IconButton from '../../components/buttons/IconButton';
import { useAppTheme } from '../../context/ThemeContext';
import { fetchAdminUsers, updateAdminUserStatus, updateAdminUserRole } from '../../redux/slices/adminUserSlice';
import { notifyError, notifySuccess } from '../../utils/appNotifier';

const AdminUsersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.adminUsers);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { colors } = useAppTheme();

  useEffect(() => {
    dispatch(fetchAdminUsers())
      .unwrap()
      .catch((err) => {
        notifyError('Users Load Failed', String(err || 'Failed to fetch users.'));
      });
  }, [dispatch]);

  const handleToggle = (user) => {
    if (user.role === 'admin' && user._id !== currentUser?._id) {
      Alert.alert('Not allowed', 'You cannot deactivate another admin account.');
      return;
    }

    const next = !user.isActive;
    Alert.alert(
      `${next ? 'Activate' : 'Deactivate'} User`,
      `Are you sure you want to ${next ? 'activate' : 'deactivate'} ${user.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: next ? 'Activate' : 'Deactivate',
          onPress: async () => {
            try {
              await dispatch(updateAdminUserStatus({ id: user._id, isActive: next })).unwrap();
              notifySuccess('User Updated', `${user.name} is now ${next ? 'active' : 'inactive'}.`);
              await dispatch(fetchAdminUsers()).unwrap();
            } catch (err) {
              notifyError('Update Failed', String(err || 'Unable to update user status.'));
            }
          },
        },
      ]
    );
  };

  const handleRoleChange = (user) => {
    const targetRole = user.role === 'admin' ? 'user' : 'admin';
    if (user._id === currentUser?._id && targetRole !== 'admin') {
      Alert.alert('Not allowed', 'You cannot remove your own admin role.');
      return;
    }

    Alert.alert(
      'Change User Role',
      `Set ${user.name} as ${targetRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await dispatch(updateAdminUserRole({ id: user._id, role: targetRole })).unwrap();
              notifySuccess('Role Updated', `${user.name} is now ${targetRole}.`);
              await dispatch(fetchAdminUsers()).unwrap();
            } catch (err) {
              notifyError('Role Update Failed', String(err || 'Unable to update user role.'));
            }
          },
        },
      ]
    );
  };

  const styles = getStyles(colors);

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <IconButton icon="arrow-left" color={colors.primaryText} onPress={() => navigation.goBack()} />
        <Text variant="h3" weight="bold">User Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="semiBold">{item.name}</Text>
                <Text variant="bodySmall" color="secondary">{item.email}</Text>
                <Text variant="caption" color="secondary">Role: {item.role}</Text>
              </View>

              <View style={styles.actionsCol}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: item.role === 'admin' ? colors.primaryLight : colors.warningLight,
                      borderColor: item.role === 'admin' ? colors.primary : colors.warning,
                    },
                  ]}
                  onPress={() => handleRoleChange(item)}
                >
                  <Text
                    variant="bodySmall"
                    weight="semiBold"
                    style={{ color: item.role === 'admin' ? colors.primary : colors.warning }}
                  >
                    {item.role === 'admin' ? 'Admin' : 'User'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: item.isActive ? colors.successLight : colors.errorLight,
                      borderColor: item.isActive ? colors.success : colors.error,
                    },
                  ]}
                  onPress={() => handleToggle(item)}
                >
                  <Text
                    variant="bodySmall"
                    weight="semiBold"
                    style={{ color: item.isActive ? colors.success : colors.error }}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    list: {
      padding: 16,
      gap: 12,
    },
    card: {
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    actionsCol: {
      gap: 8,
      alignItems: 'flex-end',
    },
    actionBtn: {
      borderWidth: 1,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
  });

export default AdminUsersScreen;