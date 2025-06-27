<template>
  <div class="withdrawals">
    <div class="page-header">
      <h1>Withdrawals</h1>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Search by ID or user..."
          style="width: 300px; margin-right: 16px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="statusFilter"
          placeholder="Status"
          style="width: 150px"
          @change="handleFiltersChange"
        >
          <el-option label="All" value="" />
          <el-option label="Pending" value="PENDING" />
          <el-option label="Approved" value="APPROVED" />
          <el-option label="Completed" value="COMPLETED" />
          <el-option label="Rejected" value="REJECTED" />
        </el-select>
      </div>
    </div>

    <el-card>
      <el-table
        :data="withdrawals"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="transactionId" label="Transaction ID" width="180" />
        <el-table-column prop="amount" label="Amount" width="150">
          <template #default="scope">
            GHS {{ scope.row.amount?.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="account.user.firstName" label="User" width="180">
          <template #default="scope">
            {{ scope.row.account?.user?.firstName }} {{ scope.row.account?.user?.lastName }}
          </template>
        </el-table-column>
        <el-table-column prop="account.group.name" label="Group" width="180">
          <template #default="scope">
            {{ scope.row.account?.group?.name }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="scope">
            <el-tag :type="getStatusColor(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Date" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" fixed="right" width="200">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'PENDING'"
              size="small"
              type="success"
              @click="approveWithdrawal(scope.row)"
            >
              Approve
            </el-button>
            <el-button
              v-if="scope.row.status === 'PENDING'"
              size="small"
              type="danger"
              @click="rejectWithdrawal(scope.row)"
            >
              Reject
            </el-button>
            <el-button
              size="small"
              type="primary"
              plain
              @click="viewDetails(scope.row)"
            >
              Details
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import TransactionService, { type Transaction } from '../../services/transactions';

const withdrawals = ref<Transaction[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const searchQuery = ref('');
const statusFilter = ref('');
const transactionService = new TransactionService();

const fetchWithdrawals = async () => {
  loading.value = true;
  try {
    withdrawals.value = await transactionService.getWithdrawals({
      page: currentPage.value,
      limit: pageSize.value,
      status: statusFilter.value
    });
    total.value = 0;
  } catch (error) {
    ElMessage.error('Failed to fetch withdrawals');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchWithdrawals();
};

const handleFiltersChange = () => {
  currentPage.value = 1;
  fetchWithdrawals();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchWithdrawals();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchWithdrawals();
};

const approveWithdrawal = async (withdrawal: Transaction) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to approve this withdrawal of GHS ${withdrawal.amount}?`,
      'Approve Withdrawal',
      {
        confirmButtonText: 'Approve',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );
    
    await transactionService.approveTransaction(withdrawal.id);
    ElMessage.success('Withdrawal approved successfully');
    fetchWithdrawals();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to approve withdrawal');
    }
  }
};

const rejectWithdrawal = async (withdrawal: Transaction) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `Why are you rejecting this withdrawal?`,
      'Reject Withdrawal',
      {
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        inputPlaceholder: 'Enter rejection reason...',
        inputType: 'textarea',
      }
    );
    
    await transactionService.rejectTransaction(withdrawal.id, reason);
    ElMessage.success('Withdrawal rejected successfully');
    fetchWithdrawals();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to reject withdrawal');
    }
  }
};

const viewDetails = (withdrawal: Transaction) => {
  ElMessageBox.alert(
    `
    <p><strong>Transaction ID:</strong> ${withdrawal.transactionId}</p>
    <p><strong>Amount:</strong> GHS ${withdrawal.amount}</p>
    <p><strong>Status:</strong> ${withdrawal.status}</p>
    <p><strong>Date:</strong> ${formatDate(withdrawal.createdAt)}</p>
    <p><strong>Description:</strong> ${withdrawal.description || 'No description'}</p>
    `,
    'Withdrawal Details',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: 'Close',
    }
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
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

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

onMounted(() => {
  fetchWithdrawals();
});
</script>

<style scoped>
.withdrawals {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
