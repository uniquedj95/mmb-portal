<template>
  <div class="audit-logs">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Audit Logs</span>
          <div>
            <el-button type="primary" size="small" @click="exportLogs">Export</el-button>
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="To"
              start-placeholder="Start date"
              end-placeholder="End date"
              @change="loadAuditLogs"
            />
          </div>
        </div>
      </template>
      
      <el-form :inline="true" class="filter-form">
        <el-form-item label="User">
          <el-select v-model="filters.userId" placeholder="Select User" clearable>
            <el-option v-for="user in users" :key="user.id" :label="user.name" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Action">
          <el-select v-model="filters.action" placeholder="Select Action" clearable>
            <el-option label="Create" value="create" />
            <el-option label="Update" value="update" />
            <el-option label="Delete" value="delete" />
            <el-option label="Login" value="login" />
            <el-option label="Logout" value="logout" />
          </el-select>
        </el-form-item>
        <el-form-item label="Module">
          <el-select v-model="filters.module" placeholder="Select Module" clearable>
            <el-option label="User Management" value="user" />
            <el-option label="Products" value="product" />
            <el-option label="Transactions" value="transaction" />
            <el-option label="Settings" value="setting" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadAuditLogs">Search</el-button>
          <el-button @click="resetFilters">Reset</el-button>
        </el-form-item>
      </el-form>
      
      <el-table
        v-loading="loading"
        :data="auditData"
        style="width: 100%"
        border
      >
        <el-table-column prop="timestamp" label="Timestamp" width="180" sortable />
        <el-table-column prop="user" label="User" width="150" />
        <el-table-column prop="ipAddress" label="IP Address" width="120" />
        <el-table-column prop="module" label="Module" width="120" />
        <el-table-column prop="action" label="Action" width="100">
          <template #default="scope">
            <el-tag :type="getActionType(scope.row.action)">{{ scope.row.action }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" />
        <el-table-column fixed="right" label="Details" width="80">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="showDetails(scope.row)">Details</el-button>
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
    
    <!-- Details Dialog -->
    <el-dialog
      v-model="detailsVisible"
      title="Audit Log Details"
      width="50%"
    >
      <div v-if="selectedLog">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="Timestamp">{{ selectedLog.timestamp }}</el-descriptions-item>
          <el-descriptions-item label="User">{{ selectedLog.user }}</el-descriptions-item>
          <el-descriptions-item label="IP Address">{{ selectedLog.ipAddress }}</el-descriptions-item>
          <el-descriptions-item label="Module">{{ selectedLog.module }}</el-descriptions-item>
          <el-descriptions-item label="Action">
            <el-tag :type="getActionType(selectedLog.action)">{{ selectedLog.action }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="Description">{{ selectedLog.description }}</el-descriptions-item>
          <el-descriptions-item label="Request Data">
            <pre>{{ JSON.stringify(selectedLog.requestData, null, 2) }}</pre>
          </el-descriptions-item>
          <el-descriptions-item v-if="selectedLog.responseData" label="Response Data">
            <pre>{{ JSON.stringify(selectedLog.responseData, null, 2) }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailsVisible = false">Close</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';

// Define types
interface AuditRecord {
  id: number;
  timestamp: string;
  user: string;
  userId: number;
  ipAddress: string;
  module: string;
  action: string;
  description: string;
  requestData: any;
  responseData?: any;
}

interface User {
  id: number;
  name: string;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

interface Filters {
  userId: number | null;
  action: string | null;
  module: string | null;
}

// State variables
const loading = ref(false);
const auditData = ref<AuditRecord[]>([]);
const dateRange = ref<[Date, Date] | null>(null);
const detailsVisible = ref(false);
const selectedLog = ref<AuditRecord | null>(null);

const users = ref<User[]>([
  { id: 1, name: 'Admin User' },
  { id: 2, name: 'John Doe' },
  { id: 3, name: 'Jane Smith' }
]);

const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const filters = reactive<Filters>({
  userId: null,
  action: null,
  module: null,
});

// Load audit logs
const loadAuditLogs = async () => {
  loading.value = true;
  try {
    // TODO: Replace with actual API call
    // Example: const response = await api.getAuditLogs({
    //   page: pagination.currentPage,
    //   pageSize: pagination.pageSize,
    //   startDate: dateRange.value?.[0],
    //   endDate: dateRange.value?.[1],
    //   userId: filters.userId,
    //   action: filters.action,
    //   module: filters.module,
    // });
    
    // Mock data for demonstration
    setTimeout(() => {
      const actions = ['create', 'update', 'delete', 'login', 'logout'];
      const modules = ['user', 'product', 'transaction', 'setting'];
      const users = ['Admin User', 'John Doe', 'Jane Smith'];
      
      const mockData: AuditRecord[] = Array(pagination.pageSize).fill(null).map((_, index) => {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const module = modules[Math.floor(Math.random() * modules.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        
        return {
          id: index + 1,
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          user,
          userId: users.indexOf(user) + 1,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          module,
          action,
          description: `${action} operation performed on ${module} module`,
          requestData: {
            endpoint: `/api/${module}s`,
            method: action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE',
            params: { id: Math.floor(Math.random() * 1000) }
          },
          responseData: action !== 'delete' ? {
            success: true,
            data: { id: Math.floor(Math.random() * 1000) }
          } : undefined
        };
      });
      
      auditData.value = mockData;
      pagination.total = 100; // Mock total
      loading.value = false;
    }, 500);
  } catch (error) {
    ElMessage.error('Failed to load audit logs');
    loading.value = false;
    console.error('Error loading audit logs:', error);
  }
};

// Get action type for styling
const getActionType = (action: string): string => {
  switch (action.toLowerCase()) {
    case 'create':
      return 'success';
    case 'update':
      return 'warning';
    case 'delete':
      return 'danger';
    case 'login':
      return 'info';
    case 'logout':
      return 'info';
    default:
      return 'info';
  }
};

// Show log details
const showDetails = (log: AuditRecord) => {
  selectedLog.value = log;
  detailsVisible.value = true;
};

// Reset filters
const resetFilters = () => {
  filters.userId = null;
  filters.action = null;
  filters.module = null;
  dateRange.value = null;
  loadAuditLogs();
};

// Pagination handlers
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  loadAuditLogs();
};

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
  loadAuditLogs();
};

// Export logs
const exportLogs = () => {
  ElMessage({
    type: 'success',
    message: 'Export started. The file will be downloaded shortly.',
  });
  // TODO: Implement actual export functionality
};

// Initial load
onMounted(() => {
  loadAuditLogs();
});
</script>

<style scoped>
.audit-logs {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
