import { ref, computed, onMounted } from "vue";
import ApiClient from "../api/index";

export interface DashboardStatistic {
  id: string;
  title: string;
  value: number;
  icon: string;
  color: string;
  formatter?: (value: number) => string;
  loading: boolean;
  prefix?: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

export interface DashboardStats {
  totalUsers: number;
  totalGroups: number;
  pendingGroups: number;
  totalTransactions: number;
  pendingTransactions: number;
  totalSavings: number;
  totalLoans: number;
  totalDepositsToday: number;
  totalWithdrawalsToday: number;
}

export function useDashboard() {
  const statistics = ref<DashboardStatistic[]>([
    {
      id: 'total-users',
      title: 'Total Users',
      value: 0,
      icon: 'User',
      color: '#409EFF',
      change: '+12%',
      changeType: 'increase',
      loading: true
    },
    {
      id: 'total-groups',
      title: 'Total Groups',
      value: 0,
      icon: 'UserFilled',
      color: '#67C23A',
      change: '+8%',
      changeType: 'increase',
      loading: true
    },
    {
      id: 'pending-approvals',
      title: 'Pending Approvals',
      value: 0,
      icon: 'Clock',
      color: '#E6A23C',
      change: '+3',
      changeType: 'increase',
      loading: true
    },
    {
      id: 'total-savings',
      title: 'Total Savings',
      value: 0,
      icon: 'Money',
      color: '#F56C6C',
      change: '+15%',
      changeType: 'increase',
      prefix: 'K ',
      loading: true
    }
  ]);

  const isLoading = ref(true);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats using API client
      const data: DashboardStats = await ApiClient.getJson('/dashboard/stats');
      
      // Update statistics with real data
      statistics.value = statistics.value.map(stat => ({
        ...stat,
        value: {
          'total-users': data.totalUsers,
          'total-groups': data.totalGroups,
          'pending-approvals': data.pendingGroups + data.pendingTransactions,
          'total-savings': data.totalSavings
        }[stat.id] || 0,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Fallback to demo data
      statistics.value = statistics.value.map(stat => ({
        ...stat,
        value: {
          'total-users': 1250,
          'total-groups': 45,
          'pending-approvals': 12,
          'total-savings': 125000
        }[stat.id] || 0,
        loading: false
      }));
    } finally {
      isLoading.value = false;
    }
  };

  // Computed properties for specific statistics
  const totalUsers = computed(
    () => statistics.value.find((stat) => stat.id === "total-users")?.value || 0
  );

  const totalGroups = computed(
    () => statistics.value.find((stat) => stat.id === "total-groups")?.value || 0
  );

  const pendingApprovals = computed(
    () => statistics.value.find((stat) => stat.id === "pending-approvals")?.value || 0
  );

  const totalSavings = computed(
    () => statistics.value.find((stat) => stat.id === "total-savings")?.value || 0
  );

  return {
    isLoading,
    statistics,
    fetchDashboardData,
    totalUsers,
    totalGroups,
    pendingApprovals,
    totalSavings,
  };
}
