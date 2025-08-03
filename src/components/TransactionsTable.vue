<template>
  <div class="transactions-table">
    <el-table
      :data="transactions"
      style="width: 100%"
      v-loading="loading"
      :default-sort="{ prop: 'createdAt', order: 'descending' }"
      :table-layout="'auto'"
      :fit="true"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
        :sortable="col.sortable"
        :width="col.width"
      >
        <template #default="scope" v-if="col.prop === 'actions'">
          <el-button
            v-if="scope.row.status === 'PENDING'"
            type="success"
            size="small"
            @click="approveTransaction(scope.row)"
          >
            Approve
          </el-button>
          <el-button
            v-if="scope.row.status === 'PENDING'"
            type="danger"
            size="small"
            @click="rejectTransaction(scope.row)"
          >
            Reject
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import TransactionService from '../services/transactions';

const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  }
});

const transactions = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(props.itemsPerPage);
const total = ref(0);

const transactionService = new TransactionService();

const fetchTransactions = async () => {
  loading.value = true;
  try {
    const response = await transactionService.getPendingTransactions();
    transactions.value = response.data || response;
    total.value = response.total || response.length;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    ElMessage.error('Failed to fetch transactions');
  } finally {
    loading.value = false;
  }
};

const approveTransaction = async (transaction) => {
  try {
    await transactionService.approveTransaction(transaction.id);
    ElMessage.success('Transaction approved successfully');
    fetchTransactions();
  } catch (error) {
    console.error('Error approving transaction:', error);
    ElMessage.error('Failed to approve transaction');
  }
};

const rejectTransaction = async (transaction) => {
  try {
    await transactionService.rejectTransaction(transaction.id, 'Rejected by admin');
    ElMessage.success('Transaction rejected successfully');
    fetchTransactions();
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    ElMessage.error('Failed to reject transaction');
  }
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  fetchTransactions();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  fetchTransactions();
};

onMounted(() => {
  fetchTransactions();
});
</script>

<style scoped>
.transactions-table {
  width: 100%;
  overflow-x: auto;
}

.transactions-table .el-table {
  width: 100%;
  min-width: 100%;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 