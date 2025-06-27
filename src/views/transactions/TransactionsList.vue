<template>
  <div class="transactions-list">
    <div class="page-header">
      <h1>All Transactions</h1>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Search by ID or description..."
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
          style="width: 150px; margin-right: 16px"
          @change="handleFiltersChange"
        >
          <el-option label="All" value="" />
          <el-option label="Pending" value="PENDING" />
          <el-option label="Approved" value="APPROVED" />
          <el-option label="Rejected" value="REJECTED" />
          <el-option label="Completed" value="COMPLETED" />
        </el-select>
        <el-select
          v-model="typeFilter"
          placeholder="Type"
          style="width: 150px"
          @change="handleFiltersChange"
        >
          <el-option label="All" value="" />
          <el-option label="Deposit" value="DEPOSIT" />
          <el-option label="Withdrawal" value="WITHDRAWAL" />
          <el-option label="Interest" value="INTEREST" />
          <el-option label="Loan Disbursement" value="LOAN_DISBURSEMENT" />
          <el-option label="Loan Repayment" value="LOAN_REPAYMENT" />
          <el-option label="Share Contribution" value="SHARE_CONTRIBUTION" />
        </el-select>
      </div>
    </div>

    <el-card>
      <el-table
        :data="transactions"
        style="width: 100%"
        v-loading="loading"
      >
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
              @click="approveTransaction(scope.row)"
            >
              Approve
            </el-button>
            <el-button
              v-if="scope.row.status === 'PENDING'"
              size="small"
              type="danger"
              @click="rejectTransaction(scope.row)"
            >
              Reject
            </el-button>
            <el-button
              size="small"
              type="primary"
              plain
              @click="viewTransactionDetails(scope.row)"
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
import { transactionsApi, type Transaction } from '../../api/transactions';

const transactions = ref<Transaction[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const searchQuery = ref('');
const statusFilter = ref('');
const typeFilter = ref('');

const fetchTransactions = async () => {
  loading.value = true;
  try {
    const data = await transactionsApi.getTransactions({
      page: currentPage.value,
      limit: pageSize.value,
      status: statusFilter.value,
      type: typeFilter.value,
      search: searchQuery.value
    });
    transactions.value = data.data;
    total.value = data.meta.totalItems;
  } catch (error) {
    ElMessage.error('Failed to fetch transactions');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchTransactions();
};

const handleFiltersChange = () => {
  currentPage.value = 1;
  fetchTransactions();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchTransactions();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchTransactions();
};

const approveTransaction = async (transaction: Transaction) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to approve this ${formatTransactionType(transaction.type)} transaction for GHS ${transaction.amount}?`,
      'Approve Transaction',
      {
        confirmButtonText: 'Approve',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );
    
    await transactionsApi.approveTransaction(transaction.id);
    ElMessage.success('Transaction approved successfully');
    fetchTransactions();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to approve transaction');
    }
  }
};

const rejectTransaction = async (transaction: Transaction) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `Why are you rejecting this ${formatTransactionType(transaction.type)} transaction?`,
      'Reject Transaction',
      {
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        inputPlaceholder: 'Enter rejection reason...',
        inputType: 'textarea',
      }
    );
    
    await transactionsApi.rejectTransaction(transaction.id, reason);
    ElMessage.success('Transaction rejected successfully');
    fetchTransactions();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to reject transaction');
    }
  }
};

const viewTransactionDetails = (transaction: Transaction) => {
  // This would typically navigate to a transaction details view
  ElMessageBox.alert(
    `
    <p><strong>Transaction ID:</strong> ${transaction.transactionId}</p>
    <p><strong>Type:</strong> ${formatTransactionType(transaction.type)}</p>
    <p><strong>Amount:</strong> GHS ${transaction.amount}</p>
    <p><strong>Status:</strong> ${transaction.status}</p>
    <p><strong>Date:</strong> ${formatDate(transaction.createdAt)}</p>
    <p><strong>Description:</strong> ${transaction.description || 'No description'}</p>
    `,
    'Transaction Details',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: 'Close',
    }
  );
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
    case 'INTEREST':
      return '';
    default:
      return '';
  }
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

const formatTransactionType = (type: string) => {
  return type?.replace(/_/g, ' ');
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString();
};

onMounted(() => {
  fetchTransactions();
});
</script>

<style scoped>
.transactions-list {
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
