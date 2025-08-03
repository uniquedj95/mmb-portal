<template>
  <div class="group-details" v-loading="loading">
    <div class="page-header">
      <el-button @click="goBack" type="text" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        Back to Groups
      </el-button>
      <h1>{{ group?.name || 'Group Details' }}</h1>
    </div>

    <div v-if="group" class="content">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card title="Group Information">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Group Name">{{ group.name }}</el-descriptions-item>
              <el-descriptions-item label="Status">
                <el-tag :type="getStatusType(group.isActive)">{{ group.isActive ? 'ACTIVE' : 'INACTIVE' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Description" :span="2">{{ group.description }}</el-descriptions-item>
              <el-descriptions-item label="Total Members">{{ group.memberCount }}</el-descriptions-item>
              <el-descriptions-item label="Total Savings">{{ formatCurrency(group.totalSavings ?? 0) }}</el-descriptions-item>
              <el-descriptions-item label="Total Loans">{{ formatCurrency(group.totalLoans ?? 0) }}</el-descriptions-item>
              <el-descriptions-item label="Created">{{ formatDate(group.createdAt) }}</el-descriptions-item>
            </el-descriptions>

            <div class="action-buttons" v-if="!group.isActive">
              <el-button type="success" @click="approveGroup">Approve Group</el-button>
              <el-button type="danger" @click="rejectGroup">Reject Group</el-button>
            </div>
          </el-card>

          <el-card title="Group Members" style="margin-top: 20px;">
            <el-table :data="members" style="width: 100%">
              <el-table-column prop="user.firstName" label="First Name" />
              <el-table-column prop="user.lastName" label="Last Name" />
              <el-table-column prop="user.email" label="Email" />
              <el-table-column prop="user.phone" label="Phone" />
              <el-table-column prop="joinedAt" label="Joined" width="150">
                <template #default="scope">
                  {{ formatDate(scope.row.joinedAt) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="Status" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'warning'">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card title="Quick Stats">
            <div class="quick-stats">
              <div class="stat-item">
                <span class="stat-label">Members</span>
                <span class="stat-value">{{ group.memberCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Savings</span>
                <span class="stat-value">GHS {{ group.totalSavings?.toLocaleString() || '0' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Loans</span>
                <span class="stat-value">GHS {{ group.totalLoans?.toLocaleString() || '0' }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Status</span>
                <el-tag :type="getStatusType(group.isActive)">{{ group.isActive ? 'ACTIVE' : 'INACTIVE' }}</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import type {  Group, GroupMember } from '../../services/groups';
import GroupService from '../../services/groups';
import { formatCurrency } from '../../utils/strs.ts';

const route = useRoute();
const router = useRouter();
const group = ref<Group | null>(null);
const members = ref<GroupMember[]>([]);
const loading = ref(false);
const groupService = new GroupService();

const fetchGroupDetails = async () => {
  const groupId = route.params.id as string;
  if (!groupId) return;

  loading.value = true;
  try {
    const [groupData, membersData] = await Promise.all([
      groupService.getGroupById(groupId),
      groupService.getGroupMembers(groupId)
    ]);
    
    group.value = groupData.data;
    members.value = membersData.data;
  } catch (error) {
    ElMessage.error('Failed to fetch group details');
  } finally {
    loading.value = false;
  }
};

const approveGroup = async () => {
  if (!group.value) return;

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to approve "${group.value.name}"?`,
      'Approve Group',
      {
        confirmButtonText: 'Approve',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );
    
    await groupService.approveGroup(group.value.id);
    ElMessage.success('Group approved successfully');
    fetchGroupDetails();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to approve group');
    }
  }
};

const rejectGroup = async () => {
  if (!group.value) return;

  try {
    const { value: reason } = await ElMessageBox.prompt(
      `Why are you rejecting "${group.value.name}"?`,
      'Reject Group',
      {
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        inputPlaceholder: 'Enter rejection reason...',
        inputType: 'textarea',
      }
    );
    
    await groupService.rejectGroup(group.value.id, reason);
    ElMessage.success('Group rejected successfully');
    fetchGroupDetails();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to reject group');
    }
  }
};

const goBack = () => {
  router.push('/groups');
};

const getStatusType = (isActive: boolean) => {
  return isActive ? 'success' : 'warning';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  fetchGroupDetails();
});
</script>

<style scoped>
.group-details {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.back-button {
  margin-bottom: 10px;
}

.action-buttons {
  margin-top: 20px;
  text-align: right;
}

.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.stat-value {
  font-weight: bold;
  color: #333;
}
</style>
