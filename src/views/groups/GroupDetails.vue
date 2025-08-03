<template>
  <div class="group-details" v-loading="loading">
    <div class="page-header">
      <h1>{{ group?.name || 'Group Details' }}</h1>
      <el-button @click="goBack" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        Back to Groups
      </el-button>
    </div>

    <div v-if="group" class="content">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card title="Group Information">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Group Name">{{ group.name }}</el-descriptions-item>
              <el-descriptions-item label="Status">
                <el-tag :type="getStatusType(group.isActive)">{{ group.isActive ? 'ACTIVE' : 'INACTIVE' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="Description" :span="2">{{ group.description }}</el-descriptions-item>
              <el-descriptions-item label="Owner">{{ group.owner?.name || 'Unknown' }}</el-descriptions-item>
              <el-descriptions-item label="Current Members">{{ group.members?.length || 0 }} / {{ group.maxMembers }}</el-descriptions-item>
              <el-descriptions-item label="Min Monthly Contribution">{{ formatCurrency(group.minMonthlyContribution) }}</el-descriptions-item>
              <el-descriptions-item label="Max Monthly Contribution">{{ formatCurrency(group.maxMonthlyContribution ?? 0) }}</el-descriptions-item>
              <el-descriptions-item label="Interest Rate">{{ toPercentage(group.interestRate, 1) }}</el-descriptions-item>
              <el-descriptions-item label="Rollover Interest Rate">{{ toPercentage(group.rolloverInterestRate, 1) }}</el-descriptions-item>
              <el-descriptions-item label="Total Savings">{{ formatCurrency(group.totalSavings ?? 0) }}</el-descriptions-item>
              <el-descriptions-item label="Created">{{ formatDate(group.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="Total Contributions">{{ formatCurrency(getTotalContributions()) }}</el-descriptions-item>
              <el-descriptions-item label="Total Loans">{{ group.loans?.length || 0  }}</el-descriptions-item>
            </el-descriptions>

            <div class="action-buttons" v-if="!group.isActive">
              <el-button type="success" @click="approveGroup">Approve Group</el-button>
              <el-button type="danger" @click="rejectGroup">Reject Group</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24"> 
          <el-card>
            <el-card-title style="margin: 30px 7px;">Group Members</el-card-title>
            <el-table :data="group.members" style="width: 100%">
              <el-table-column prop="user.name" label="Name" />
              <el-table-column prop="user.phoneNumber" label="Phone" />
              <el-table-column prop="user.email" label="Email" />
              <el-table-column prop="totalContributions" label="Total Contributions" width="150">
                <template #default="scope">
                  {{ formatCurrency(scope.row.totalContributions) }}
                </template>
              </el-table-column>
              <el-table-column prop="joinedAt" label="Joined" width="150">
                <template #default="scope">
                  {{ formatDate(scope.row.joinedAt) }}
                </template>
              </el-table-column>

            </el-table>
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
import type { Group } from '../../services/groups';
import GroupService from '../../services/groups';
import { formatCurrency, toPercentage } from '../../utils/strs.ts';

const route = useRoute();
const router = useRouter();
const group = ref<Group | null>(null);
const loading = ref(false);
const groupService = new GroupService();

const fetchGroupDetails = async () => {
  const groupId = route.params.id as string;
  if (!groupId) return;

  loading.value = true;
  try {
    group.value = await groupService.getGroupById(groupId);
    // Members are included in the group response
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

const getTotalContributions = () => {
  if (!group.value?.members) return 0;
  return group.value.members.reduce((total, member) => total + (member.totalContributions || 0), 0);
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
  float: right;
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
