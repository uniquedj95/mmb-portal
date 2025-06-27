<template>
  <div class="reports-dashboard">
    <div class="page-header">
      <h1>Reports Dashboard</h1>
      <p>Overview of all available reports and analytics</p>
    </div>

    <div class="reports-grid">
      <!-- Financial Reports Card -->
      <el-card class="report-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <Money />
            </el-icon>
            <span>Financial Reports</span>
          </div>
        </template>
        <div class="card-content">
          <p>View financial summaries, transaction reports, and revenue analytics</p>
          <el-button type="primary" @click="$router.push('/reports/financial')">
            View Reports
          </el-button>
        </div>
      </el-card>

      <!-- Audit Logs Card -->
      <el-card class="report-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <Document />
            </el-icon>
            <span>Audit Logs</span>
          </div>
        </template>
        <div class="card-content">
          <p>Monitor system activities, user actions, and security events</p>
          <el-button type="primary" @click="$router.push('/reports/audit')">
            View Logs
          </el-button>
        </div>
      </el-card>

      <!-- Transaction Analytics Card -->
      <el-card class="report-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <TrendCharts />
            </el-icon>
            <span>Transaction Analytics</span>
          </div>
        </template>
        <div class="card-content">
          <p>Analyze transaction patterns, volumes, and trends over time</p>
          <el-button type="primary" disabled>
            Coming Soon
          </el-button>
        </div>
      </el-card>

      <!-- User Activity Card -->
      <el-card class="report-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon class="card-icon">
              <User />
            </el-icon>
            <span>User Activity</span>
          </div>
        </template>
        <div class="card-content">
          <p>Track user engagement, login patterns, and platform usage</p>
          <el-button type="primary" disabled>
            Coming Soon
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- Quick Stats Section -->
    <div class="quick-stats">
      <h2>Quick Statistics</h2>
      <div class="stats-grid">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.totalTransactions }}</div>
            <div class="stat-label">Total Transactions</div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.pendingTransactions }}</div>
            <div class="stat-label">Pending Transactions</div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.activeUsers }}</div>
            <div class="stat-label">Active Users</div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.systemAlerts }}</div>
            <div class="stat-label">System Alerts</div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Money, Document, TrendCharts, User } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const stats = ref({
  totalTransactions: '1,234',
  pendingTransactions: '56',
  activeUsers: '789',
  systemAlerts: '3'
});

const fetchStats = async () => {
  try {
    // This would be replaced with actual API calls
    // const response = await fetch('/api/reports/dashboard-stats');
    // const data = await response.json();
    // stats.value = data;
    
    // For now, using mock data
    console.log('Dashboard stats loaded');
  } catch (error) {
    ElMessage.error('Failed to load dashboard statistics');
  }
};

onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.reports-dashboard {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #7f8c8d;
  font-size: 16px;
}

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.report-card {
  transition: transform 0.2s ease;
}

.report-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
}

.card-icon {
  font-size: 20px;
  color: #409eff;
}

.card-content {
  padding: 10px 0;
}

.card-content p {
  margin: 0 0 15px 0;
  color: #7f8c8d;
  line-height: 1.5;
}

.quick-stats {
  margin-top: 40px;
}

.quick-stats h2 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 22px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-card {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9em;
  opacity: 0.9;
}
</style>
