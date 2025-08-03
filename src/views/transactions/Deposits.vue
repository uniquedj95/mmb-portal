<template>
  <div class="deposits">
    <div class="page-header">
      <h1>Deposits</h1>
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
        :data="deposits"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="id" label="Transaction ID" />
        <el-table-column prop="amount" label="Amount">
          <template #default="scope">
            {{ formatCurrency(scope.row.amount ?? 0) }}
          </template>
        </el-table-column>
        <el-table-column prop="user.name" label="User">
          <template #default="scope">
            {{ scope.row.user?.name }}
          </template>
        </el-table-column>
        <el-table-column prop="group.name" label="Group">
          <template #default="scope">
            {{ scope.row.group?.name || 'N/A' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status">
          <template #default="scope">
            <el-tag :type="getStatusColor(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Date">
          <template #default="scope">
            {{ toDisplayDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 'PENDING'"
              size="small"
              type="success"
              @click="approveDeposit(scope.row)"
            >
              Approve
            </el-button>
            <el-button
              v-if="scope.row.status === 'PENDING'"
              size="small"
              type="danger"
              @click="rejectDeposit(scope.row)"
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
import { ElMessage, ElMessageBox, ElCard, ElPagination } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { formatCurrency } from '../../utils/strs';
import TransactionService, { type Transaction } from '../../services/transactions';
import { toDisplayDate } from '../../utils/date';

const deposits = ref<Transaction[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const searchQuery = ref('');
const statusFilter = ref('');

const transactionService = new TransactionService();

const fetchDeposits = async () => {
  loading.value = true;
  try {
    const response = await transactionService.getDeposits({
      page: currentPage.value,
      limit: pageSize.value,
      status: statusFilter.value,
      search: searchQuery.value
    });
    deposits.value = response.data;
    total.value = response.meta.totalItems;
    currentPage.value = response.meta.currentPage;
    pageSize.value = response.meta.pageSize;
  } catch (error) {
    ElMessage.error('Failed to fetch deposits');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchDeposits();
};

const handleFiltersChange = () => {
  currentPage.value = 1;
  fetchDeposits();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchDeposits();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchDeposits();
};

const approveDeposit = async (deposit: Transaction) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to approve this deposit of ${formatCurrency(deposit.amount)}?`,
      'Approve Deposit',
      {
        confirmButtonText: 'Approve',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );
    
    await transactionService.approveTransaction(deposit.id);
    ElMessage.success('Deposit approved successfully');
    fetchDeposits();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to approve deposit');
    }
  }
};

const rejectDeposit = async (deposit: Transaction) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `Why are you rejecting this deposit?`,
      'Reject Deposit',
      {
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        inputPlaceholder: 'Enter rejection reason...',
        inputType: 'textarea',
      }
    );
    
    await transactionService.rejectTransaction(deposit.id, reason);
    ElMessage.success('Deposit rejected successfully');
    fetchDeposits();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to reject deposit');
    }
  }
};

const viewDetails = (deposit: Transaction) => {
  // This would typically navigate to a deposit details view
  ElMessageBox.alert(
    `
    <p><strong>Transaction ID:</strong> ${deposit.id}</p>
    <p><strong>Amount:</strong> ${ formatCurrency(deposit.amount ?? 0)}</p>
    <p><strong>Status:</strong> ${deposit.status}</p>
    <p><strong>Date:</strong> ${ toDisplayDate(deposit.createdAt)}</p>
    <p><strong>Reference:</strong> ${deposit.reference || 'No reference'}</p>
    <p><strong>User:</strong> ${deposit.user?.name}</p>
    <p><strong>Group:</strong> ${deposit.group?.name || 'N/A'}</p>
    `,
    'Deposit Details',
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

onMounted(() => {
  fetchDeposits();
});
</script>

<style scoped>
.deposits {
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
