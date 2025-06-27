<template>
  <div class="pending-groups">
    <div class="page-header">
      <h1>Pending Group Approvals</h1>
      <el-alert
        title="Groups requiring your approval"
        type="info"
        show-icon
        :closable="false"
      />
    </div>

    <el-card>
      <el-table
        :data="pendingGroups"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="name" label="Group Name" sortable />
        <el-table-column prop="description" label="Description" />
        <el-table-column prop="ownerId" label="Owner" width="150">
          <template #default="scope">
            {{ getOwnerName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Requested" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewGroup(scope.row)">
              View Details
            </el-button>
            <el-button
              size="small"
              type="success"
              @click="approveGroup(scope.row)"
            >
              Approve
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="rejectGroup(scope.row)"
            >
              Reject
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && pendingGroups.length === 0" description="No pending groups" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { type Group } from '../../services/groups';
import GroupService from '../../services/groups';

const router = useRouter();
const pendingGroups = ref<Group[]>([]);
const loading = ref(false);
const groupService = new GroupService();

const fetchPendingGroups = async () => {
  loading.value = true;
  try {
    const data = await groupService.getPendingGroups();
    pendingGroups.value = data.data;
  } catch (error) {
    ElMessage.error('Failed to fetch pending groups');
  } finally {
    loading.value = false;
  }
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
    fetchPendingGroups();
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
    fetchPendingGroups();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to reject group');
    }
  }
};

const getOwnerName = (group: Group) => {
  // This would typically come from the API response
  return `User ${group.ownerId}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  fetchPendingGroups();
});
</script>

<style scoped>
.pending-groups {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin-bottom: 16px;
}
</style>
