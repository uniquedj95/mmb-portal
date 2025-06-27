<template>
  <div class="user-details" v-loading="loading">
    <div class="page-header">
      <el-button @click="goBack" type="text" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        Back to Users
      </el-button>
      <h1>{{ user ? `${user.firstName} ${user.lastName}` : 'User Details' }}</h1>
    </div>

    <div v-if="user" class="content">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card title="User Information">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Full Name">{{ user.firstName }} {{ user.lastName }}</el-descriptions-item>
              <el-descriptions-item label="Email">{{ user.email }}</el-descriptions-item>
              <el-descriptions-item label="Phone">{{ user.phone }}</el-descriptions-item>
              <el-descriptions-item label="ID Type">{{ user.idType }}</el-descriptions-item>
              <el-descriptions-item label="ID Number">{{ user.idNumber }}</el-descriptions-item>
              <el-descriptions-item label="Role">
                <el-tag :type="getRoleType(user.role?.name)">{{ user.role?.name }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Status">
                <el-tag :type="getStatusType(user.status)">{{ user.status }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Joined">{{ formatDate(user.createdAt) }}</el-descriptions-item>
            </el-descriptions>

            <div class="action-buttons">
              <el-button
                v-if="user.status === 'ACTIVE'"
                type="warning"
                @click="updateUserStatus('SUSPENDED')"
              >
                Suspend User
              </el-button>
              <el-button
                v-if="user.status === 'SUSPENDED'"
                type="success"
                @click="updateUserStatus('ACTIVE')"
              >
                Activate User
              </el-button>
              <el-button
                v-if="user.status === 'ACTIVE'"
                type="info"
                @click="updateUserStatus('INACTIVE')"
              >
                Deactivate User
              </el-button>
            </div>
          </el-card>

          <el-card title="User Groups" style="margin-top: 20px;">
            <el-table :data="userGroups" style="width: 100%">
              <el-table-column prop="name" label="Group Name" />
              <el-table-column prop="description" label="Description" />
              <el-table-column prop="memberCount" label="Members" width="100" />
              <el-table-column prop="status" label="Status" width="120">
                <template #default="scope">
                  <el-tag :type="getGroupStatusType(scope.row.status)">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="joinedAt" label="Joined" width="150">
                <template #default="scope">
                  {{ formatDate(scope.row.joinedAt) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <el-card title="Recent Transactions" style="margin-top: 20px;">
            <el-table :data="userTransactions" style="width: 100%">
              <el-table-column prop="transactionId" label="Transaction ID" width="180" />
              <el-table-column prop="type" label="Type" width="150">
                <template #default="scope">
                  <el-tag :type="getTransactionTypeColor(scope.row.type)">
                    {{ formatTransactionType(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="amount" label="Amount" width="150">
                <template #default="scope">
                  GHS {{ scope.row.amount?.toLocaleString() }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="Status" width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="Date" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createdAt) }}
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card title="User Statistics">
            <div class="user-stats" v-if="userStats">
              <div class="stat-item">
                <span class="stat-label">Total Groups</span>
                <span class="stat-value">{{ userStats.totalGroups || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Savings</span>
                <span class="stat-value">GHS {{ userStats.totalSavings?.toLocaleString() || '0' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Loans</span>
                <span class="stat-value">GHS {{ userStats.totalLoans?.toLocaleString() || '0' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Credit Score</span>
                <span class="stat-value">{{ userStats.creditScore || 'N/A' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Transactions</span>
                <span class="stat-value">{{ userStats.totalTransactions || 0 }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import UserService, { type User } from '../../services/users';
import { Group } from '../../services/groups';
import { Transaction } from '../../services/transactions';

const route = useRoute();
const router = useRouter();
const user = ref<User | null>(null);
const userGroups = ref<Group[]>([]);
const userTransactions = ref<Transaction[]>([]);
const userStats = ref<any>();
const loading = ref(false);

const userService = new UserService();

const fetchUserDetails = async () => {
  const userId = Number(route.params.id);
  if (!userId) return;

  loading.value = true;
  try {
    const [userData, groupsData, transactionsData, statsData] = await Promise.all([
      userService.getUserById(userId),
      userService.getUserGroups(userId),
      userService.getUserTransactions(userId, { limit: 10 }),
      userService.getUserStats(userId)
    ]);
    
    user.value = userData;
    userGroups.value = groupsData;
    userTransactions.value = transactionsData;
    userStats.value = statsData.data;
  } catch (error) {
    ElMessage.error('Failed to fetch user details');
  } finally {
    loading.value = false;
  }
};

const updateUserStatus = async (newStatus: string) => {
  if (!user.value) return;

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to ${newStatus.toLowerCase()} user "${user.value.firstName} ${user.value.lastName}"?`,
      'Update User Status',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );
    
    await userService.updateUserStatus(user.value.id, newStatus);
    ElMessage.success(`User ${newStatus.toLowerCase()} successfully`);
    fetchUserDetails();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to update user status');
    }
  }
};

const goBack = () => {
  router.push('/users');
};

const getRoleType = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'danger';
    case 'Group Leader':
      return 'warning';
    case 'Member':
      return 'info';
    default:
      return '';
  }
};

const getStatusType = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'info';
    case 'SUSPENDED':
      return 'danger';
    case 'PENDING':
      return 'warning';
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    case 'COMPLETED':
      return 'info';
    default:
      return '';
  }
};

const getGroupStatusType = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'INACTIVE':
      return 'info';
    default:
      return '';
  }
};

const getTransactionTypeColor = (type: string) => {
  switch (type) {
    case 'DEPOSIT':
      return 'success';
    case 'WITHDRAWAL':
      return 'danger';
    case 'LOAN_DISBURSEMENT':
      return 'primary';
    case 'LOAN_REPAYMENT':
      return 'warning';
    case 'SHARE_CONTRIBUTION':
      return 'info';
    default:
      return '';
  }
};

const formatTransactionType = (type: string) => {
  return type?.replace(/_/g, ' ');
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  fetchUserDetails();
});
</script>

<style scoped>
.user-details {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.back-button {
  margin-bottom: 10px;
}

.action-buttons {
  margin-top: 20px;
  text-align: right;
}

.user-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-value {
  font-weight: bold;
  color: #333;
}
</style>
