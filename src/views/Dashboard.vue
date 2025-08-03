<template>
  <div class="centered">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-row :gutter="20">
          <el-col
            v-for="stat in statistics"
            :key="stat.id"
            :span="6"
            :xs="24"
            :sm="12"
            :md="6"
          >
            <statistics-card v-bind="stat" />
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="12">
            <el-card>
              <h3>Loan Portfolio Overview</h3>
              <div ref="loanChartRef" style="width: 100%; height: 300px"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <h3>Savings Growth Trend</h3>
              <div ref="savingsChartRef" style="width: 100%; height: 300px"></div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px">
          <el-col :span="24">
            <el-card>
              <h3>Pending Transactions</h3>
              <transactions-table
                :columns="columns"
                :items-per-page="7"
              />
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import StatisticsCard from "../components/StatisticsCard.vue";
import TransactionsTable from "../components/TransactionsTable.vue";
import { useDashboard } from "../composables/useDashboard";
import { useCharts } from "../composables/useCharts";

const { statistics, isLoading, fetchDashboardData } = useDashboard();
const {
  loanChartRef,
  savingsChartRef,
  initCharts,
  disposeCharts,
  fetchChartData,
} = useCharts();

// Define table columns for transactions
const columns = [
  {
    prop: 'transaction_id',
    label: 'Transaction ID',
    sortable: true,
  },
  {
    prop: 'type',
    label: 'Type',
    sortable: true,
  },
  {
    prop: 'amount',
    label: 'Amount',
    sortable: true,
  },
  {
    prop: 'status',
    label: 'Status',
    sortable: true,
  },
  {
    prop: 'created_at',
    label: 'Date',
    sortable: true,
  },
  {
    prop: 'actions',
    label: 'Actions',
  }
];

onMounted(() => {
  // Fetch dashboard data
  fetchDashboardData();

  // Fetch chart data
  fetchChartData();

  // Initialize charts
  initCharts();
});

// Dispose charts
onBeforeUnmount(disposeCharts);
</script>
