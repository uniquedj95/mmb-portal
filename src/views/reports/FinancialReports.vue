<template>
  <div class="financial-reports">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Financial Reports</span>
          <div>
            <el-button type="primary" size="small" @click="exportReport">Export</el-button>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="To"
              start-placeholder="Start date"
              end-placeholder="End date"
              @change="loadFinancialReports"
            />
          </div>
        </div>
      </template>
      <el-table
        v-loading="loading"
        :data="financialData"
        style="width: 100%"
        border
      >
        <el-table-column prop="date" label="Date" width="180" />
        <el-table-column prop="transactionId" label="Transaction ID" />
        <el-table-column prop="type" label="Type" />
        <el-table-column prop="amount" label="Amount">
          <template #default="scope">
            <span :class="{ 'text-success': scope.row.amount > 0, 'text-danger': scope.row.amount < 0 }">
              {{ formatCurrency(scope.row.amount) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="Balance">
          <template #default="scope">
            {{ formatCurrency(scope.row.balance) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// Define types
interface FinancialRecord {
  id: number;
  date: string;
  transactionId: string;
  type: string;
  amount: number;
  balance: number;
  status: string;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

// State variables
const loading = ref(false);
const financialData = ref<FinancialRecord[]>([]);
const dateRange = ref<[Date, Date] | null>(null);

const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// Load financial reports
const loadFinancialReports = async () => {
  loading.value = true;
  try {
    // TODO: Replace with actual API call
    // Example: const response = await api.getFinancialReports({
    //   page: pagination.currentPage,
    //   pageSize: pagination.pageSize,
    //   startDate: dateRange.value?.[0],
    //   endDate: dateRange.value?.[1],
    // });
    
    // Mock data for demonstration
    setTimeout(() => {
      const mockData: FinancialRecord[] = Array(pagination.pageSize).fill(null).map((_, index) => ({
        id: index + 1,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        transactionId: `TRX-${Math.floor(Math.random() * 1000000)}`,
        type: ['Payment', 'Withdrawal', 'Deposit', 'Refund'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 2000) * (Math.random() > 0.5 ? 1 : -1),
        balance: Math.floor(Math.random() * 10000),
        status: ['Completed', 'Pending', 'Failed', 'Processing'][Math.floor(Math.random() * 4)]
      }));
      
      financialData.value = mockData;
      pagination.total = 100; // Mock total
      loading.value = false;
    }, 500);
  } catch (error) {
    ElMessage.error('Failed to load financial reports');
    loading.value = false;
    console.error('Error loading financial reports:', error);
  }
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Get status type for styling
const getStatusType = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'processing':
      return 'info';
    case 'failed':
      return 'danger';
    default:
      return 'info';
  }
};

// Pagination handlers
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  loadFinancialReports();
};

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
  loadFinancialReports();
};

// Export report
const exportReport = () => {
  ElMessageBox.confirm(
    'Do you want to export the financial report?',
    'Export Confirmation',
    {
      confirmButtonText: 'Export',
      cancelButtonText: 'Cancel',
      type: 'info',
    }
  )
    .then(() => {
      ElMessage({
        type: 'success',
        message: 'Export started. The file will be downloaded shortly.',
      });
      // TODO: Implement actual export functionality
    })
    .catch(() => {
      // User canceled
    });
};

// Initial load
onMounted(() => {
  loadFinancialReports();
});
</script>

<style scoped>
.financial-reports {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
