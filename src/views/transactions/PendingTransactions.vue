<template>
  <div class="pending-transactions">
    <div class="page-header">
      <h1>Pending Transactions</h1>
      <el-alert
        title="These transactions require your approval"
        type="warning"
        show-icon
        :closable="false"
      />
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
            {{ formatCurrency(scope.row.amount ?? 0) }}
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
        <el-table-column prop="createdAt" label="Date" width="180">
          <template #default="scope">
            {{ toDisplayDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" fixed="right" width="200">
          <template #default="scope">
            <el-button
              size="small"
              type="success"
              @click="approveTransaction(scope.row)"
            >
              Approve
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="rejectTransaction(scope.row)"
            >
              Reject
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && transactions.length === 0" description="No pending transactions" />

      <div class="pagination-container" v-if="transactions.length > 0">
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
import { formatCurrency } from '../../utils/strs';
import { transactionsApi, type Transaction } from '../../api/transactions';
import { toDisplayDate } from '../../utils/date';

const transactions = ref<Transaction[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

const fetchPendingTransactions = async () => {
  loading.value = true;
  try {
    const data = await transactionsApi.getPendingTransactions();
    transactions.value = data.data;
    total.value = data.meta.totalItems;
  } catch (error) {
    ElMessage.error('Failed to fetch pending transactions');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchPendingTransactions();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchPendingTransactions();
};

const approveTransaction = async (transaction: Transaction) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to approve this ${formatTransactionType(transaction.type)} transaction for ${formatCurrency(transaction.amount)}?`,
      'Approve Transaction',
      {
        confirmButtonText: 'Approve',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );
    
    await transactionsApi.approveTransaction(transaction.id);
    ElMessage.success('Transaction approved successfully');
    fetchPendingTransactions();
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
    fetchPendingTransactions();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to reject transaction');
    }
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
    case 'INTEREST':
      return '';
    default:
      return '';
  }
};

const formatTransactionType = (type: string) => {
  return type?.replace(/_/g, ' ');
};

onMounted(() => {
  fetchPendingTransactions();
});
</script>

<style scoped>
.pending-transactions {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
