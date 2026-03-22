import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import Screen from '../../components/layout/Screen';
import Text from '../../components/typography/Text';
import IconButton from '../../components/buttons/IconButton';
import { useAppTheme } from '../../context/ThemeContext';
import { fetchAdminAnalytics } from '../../redux/slices/adminAnalyticsSlice';
import { formatCurrency } from '../../utils/formatCurrency';
import { printAnalyticsReport } from '../../utils/printUtils';

const { width } = Dimensions.get('window');

const AdminAnalyticsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { colors } = useAppTheme();
  const { data, loading } = useSelector((state) => state.adminAnalytics);

  useEffect(() => {
    dispatch(fetchAdminAnalytics());
  }, [dispatch]);

  const styles = getStyles(colors);

  const handlePrint = async () => {
    try {
      await printAnalyticsReport(data);
    } catch (error) {
      Alert.alert('Print failed', error?.message || 'Unable to print analytics report right now.');
    }
  };

  if (loading && !data) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  const summary = data?.summary || {};
  const topProducts = data?.topProducts || [];
  const orderStatus = data?.orderStatus || [];
  const monthlySales = data?.monthlySales || [];

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => colors.secondaryText,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary
    },
    decimalPlaces: 0
  };

  const revenueData = {
    labels: monthlySales.length ? monthlySales.map(m => m.label).reverse() : ['No Data'],
    datasets: [{
      data: monthlySales.length ? monthlySales.map(m => m.revenue || 0).reverse() : [0]
    }]
  };

  const productsData = {
    labels: topProducts.length ? topProducts.slice(0, 5).map(p => (p.name.length > 8 ? p.name.substring(0, 8) + '..' : p.name)) : ['No Data'],
    datasets: [{
      data: topProducts.length ? topProducts.slice(0, 5).map(p => p.sold || 0) : [0]
    }]
  };

  const statusColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];
  const orderStatusData = orderStatus.length ? orderStatus.map((item, index) => ({
    name: item.status,
    count: item.count,
    color: statusColors[index % statusColors.length],
    legendFontColor: colors.primaryText,
    legendFontSize: 12
  })) : [{ name: 'No Data', count: 1, color: '#e5e7eb', legendFontColor: colors.primaryText, legendFontSize: 12 }];

  return (
    <Screen edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <IconButton icon="arrow-left" color={colors.primaryText} onPress={() => navigation.goBack()} />
        <Text variant="h3" weight="bold">Analytics</Text>
        <IconButton icon="printer-outline" color={colors.primaryText} onPress={handlePrint} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text variant="caption" color="secondary" style={styles.statLabel}>Total Revenue</Text>
            <Text variant="h4" weight="bold" color="primary">{formatCurrency(summary.totalRevenue || 0)}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text variant="caption" color="secondary" style={styles.statLabel}>Total Orders</Text>
            <Text variant="h4" weight="bold">{summary.totalOrders || 0}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text variant="caption" color="secondary" style={styles.statLabel}>Active Users</Text>
            <Text variant="h4" weight="bold">{summary.activeUsers || 0}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text variant="caption" color="secondary" style={styles.statLabel}>Products</Text>
            <Text variant="h4" weight="bold">{summary.totalProducts || 0}</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text variant="h4" weight="semiBold" style={{marginBottom: 4}}>Revenue Trend</Text>
          <Text variant="caption" color="secondary" style={{marginBottom: 16}}>Last 6 Months</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={revenueData}
              width={Math.max(width - 72, monthlySales.length * 60)}
              height={220}
              chartConfig={{...chartConfig, formatYLabel: (y) => formatCurrency(y).replace('P', '')}}
              bezier
              style={{ borderRadius: 12, marginVertical: 8 }}
            />
          </ScrollView>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text variant="h4" weight="semiBold" style={{marginBottom: 4}}>Top Products</Text>
          <Text variant="caption" color="secondary" style={{marginBottom: 16}}>By units sold</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={productsData}
              width={Math.max(width - 72, topProducts.slice(0, 5).length * 80)}
              height={220}
              yAxisLabel=""
              chartConfig={chartConfig}
              verticalLabelRotation={15}
              fromZero
              showValuesOnTopOfBars
              style={{ borderRadius: 12 }}
            />
          </ScrollView>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text variant="h4" weight="semiBold" style={{marginBottom: 8}}>Order Status Distribution</Text>
          <PieChart
            data={orderStatusData}
            width={width - 72}
            height={200}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="0"
            absolute
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const getStyles = (colors) =>
  StyleSheet.create({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    scroll: {
      padding: 16,
      gap: 20,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 16,
    },
    statCard: {
      width: '47%',
      borderWidth: 1,
      borderRadius: 20,
      paddingVertical: 20,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
    statLabel: {
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    sectionCard: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 20,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
    },
  });

export default AdminAnalyticsScreen;