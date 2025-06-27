<template>
  <div class="users-list">
    <div class="page-header">
      <h1>All Users</h1>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Search users..."
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
          style="width: 150px; margin-right: 16px"
          @change="handleFiltersChange"
        >
          <el-option label="All" value="" />
          <el-option label="Active" value="ACTIVE" />
          <el-option label="Inactive" value="INACTIVE" />
          <el-option label="Suspended" value="SUSPENDED" />
        </el-select>
        <el-select
          v-model="roleFilter"
          placeholder="Role"
          style="width: 150px"
          @change="handleFiltersChange"
        >
          <el-option label="All" value="" />
          <el-option label="Admin" value="1" />
          <el-option label="Group Leader" value="2" />
          <el-option label="Member" value="3" />
        </el-select>
      </div>
    </div>

    <el-card>
      <el-table
        :data="users"
        style="width: 100%"
        v-loading="loading"
        @row-click="handleRowClick"
      >
        <el-table-column prop="firstName" label="First Name" sortable />
        <el-table-column prop="lastName" label="Last Name" sortable />
        <el-table-column prop="email" label="Email" />
        <el-table-column prop="phone" label="Phone" width="150" />
        <el-table-column prop="role.name" label="Role" width="120">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role?.name)">
              {{ scope.row.role?.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="Joined" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200">
          <template #default="scope">
            <el-button size="small" @click.stop="viewUser(scope.row)">
              View
            </el-button>
            <el-dropdown @click.stop trigger="click">
              <el-button size="small" type="primary" plain>
                Actions<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="scope.row.status === 'ACTIVE'"
                    @click="updateUserStatus(scope.row, 'SUSPENDED')"
                  >
                    Suspend User
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="scope.row.status === 'SUSPENDED'"
                    @click="updateUserStatus(scope.row, 'ACTIVE')"
                  >
                    Activate User
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="scope.row.status === 'ACTIVE'"
                    @click="updateUserStatus(scope.row, 'INACTIVE')"
                  >
                    Deactivate User
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
import { Search, ArrowDown } from '@element-plus/icons-vue';
import UserService, { type User } from '../../services/users';

const router = useRouter();
const users = ref<User[]>([]);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);
const searchQuery = ref('');
const statusFilter = ref('');
const roleFilter = ref('');
const userService = new UserService();

const fetchUsers = async () => {
  loading.value = true;
  try {
    const data = await userService.getUsers({
      page: currentPage.value,
      limit: pageSize.value,
      status: statusFilter.value,
      roleId: Number(roleFilter.value) ?? -1,
      search: searchQuery.value,
    });
    users.value = data;
    total.value = 0;
  } catch (error) {
    ElMessage.error('Failed to fetch users');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchUsers();
};

const handleFiltersChange = () => {
  currentPage.value = 1;
  fetchUsers();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchUsers();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchUsers();
};

const handleRowClick = (row: User) => {
  viewUser(row);
};

const viewUser = (user: User) => {
  router.push(`/users/${user.id}`);
};

const updateUserStatus = async (user: User, newStatus: string) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to ${newStatus.toLowerCase()} user "${user.firstName} ${user.lastName}"?`,
      'Update User Status',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );
    
    await userService.updateUserStatus(user.id, newStatus);
    ElMessage.success(`User ${newStatus.toLowerCase()} successfully`);
    fetchUsers();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to update user status');
    }
  }
};

const getRoleType = (role: string) => {
  switch (role) {
    case 'Admin':
      return 'danger';
    case 'Group Leader':
      return 'warning';
    case 'Member':
      return 'info';
    default:
      return '';
  }
};

const getStatusType = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'info';
    case 'SUSPENDED':
      return 'danger';
    default:
      return '';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.users-list {
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
