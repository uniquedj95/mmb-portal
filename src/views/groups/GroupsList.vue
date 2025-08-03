<template>
  <div class="groups-list">
    <div class="page-header">
      <h1>All Groups</h1>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Search groups..."
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
          placeholder="Filter by status"
          style="width: 150px"
          @change="handleStatusFilter"
        >
          <el-option label="All" value="" />
          <el-option label="Active" value="ACTIVE" />
          <el-option label="Pending" value="PENDING" />
          <el-option label="Inactive" value="INACTIVE" />
        </el-select>
      </div>
    </div>

    <el-card>
      <el-table
        :data="groups"
        style="width: 100%"
        v-loading="loading"
        @row-click="handleRowClick"
      >
        <el-table-column prop="name" label="Group Name" sortable />
        <el-table-column prop="description" label="Description" />
        <el-table-column prop="memberCount" label="Members" width="100">
          <template #default="scope">
            {{ scope.row.members?.length || scope.row.memberCount || 0 }} / {{ scope.row.maxMembers || '?' }}
          </template>
        </el-table-column>
        <el-table-column prop="totalSavings" label="Total Savings" width="150">
          <template #default="scope">
            {{ formatCurrency(scope.row.totalSavings ?? 0) }}
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="Status" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.isActive)">
              {{ scope.row.isActive ? 'ACTIVE' : 'INACTIVE' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Created" width="180">
          <template #default="scope">
            {{ toDisplayDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200">
          <template #default="scope">
            <el-button size="small" @click.stop="viewGroup(scope.row)">
              View
            </el-button>
            <el-button
              v-if="!scope.row.isActive"
              size="small"
              type="success"
              @click.stop="approveGroup(scope.row)"
            >
              Approve
            </el-button>
            <el-button
              v-if="!scope.row.isActive"
              size="small"
              type="danger"
              @click.stop="rejectGroup(scope.row)"
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import { type Group } from '../../services/groups';
import GroupService from '../../services/groups';
import { toDisplayDate } from '../../utils/date';
import { formatCurrency } from '../../utils/strs.ts';

const router = useRouter();
const groups = ref<Group[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const searchQuery = ref('');
const statusFilter = ref('');

const groupService = new GroupService();

const fetchGroups = async () => {
  loading.value = true;
  try {
    const data = await groupService.getGroups({
      page: currentPage.value,
      limit: pageSize.value,
      status: statusFilter.value,
      search: searchQuery.value,
    });
    groups.value = data.data;
    total.value = data.meta.totalItems;
  } catch (error) {
    ElMessage.error('Failed to fetch groups');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchGroups();
};

const handleStatusFilter = () => {
  currentPage.value = 1;
  fetchGroups();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchGroups();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchGroups();
};

const handleRowClick = (row: Group) => {
  viewGroup(row);
};

const viewGroup = (group: Group) => {
  router.push(`/groups/${group.id}`);
};

const approveGroup = async (group: Group) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to approve "${group.name}"?`,
      'Approve Group',
      {
        confirmButtonText: 'Approve',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );
    
    await groupService.approveGroup(group.id);
    ElMessage.success('Group approved successfully');
    fetchGroups();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to approve group');
    }
  }
};

const rejectGroup = async (group: Group) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      `Why are you rejecting "${group.name}"?`,
      'Reject Group',
      {
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        inputPlaceholder: 'Enter rejection reason...',
        inputType: 'textarea',
      }
    );
    
    await groupService.rejectGroup(group.id, reason);
    ElMessage.success('Group rejected successfully');
    fetchGroups();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to reject group');
    }
  }
};

const getStatusType = (isActive: boolean) => {
  return isActive ? 'success' : 'warning';
};

onMounted(() => {
  fetchGroups();
});
</script>

<style scoped>
.groups-list {
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
