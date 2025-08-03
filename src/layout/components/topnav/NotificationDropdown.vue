<template>
  <el-popover
    placement="bottom"
    :width="320"
    trigger="click"
    popper-class="notifications-popover"
  >
    <template #reference>
      <el-menu-item class="notification-menu-item">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0">
          <el-icon class="navbar-icon">
            <Bell />
          </el-icon>
        </el-badge>
      </el-menu-item>
    </template>
    
    <div class="notifications-panel">
      <div class="notifications-header">
        <h4>Notifications</h4>
        <el-button 
          v-if="unreadCount > 0" 
          text 
          size="small" 
          @click="markAllAsRead"
        >
          Mark all as read
        </el-button>
      </div>
      
      <el-scrollbar max-height="400px">
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else-if="notifications.length === 0" class="empty-state">
          <el-icon size="40" color="#909399">
            <Bell />
          </el-icon>
          <p>No notifications</p>
        </div>
        
        <div v-else class="notifications-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
            @click="markAsRead(notification)"
          >
            <div class="notification-content">
              <h5 class="notification-title">{{ notification.title }}</h5>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
            <div v-if="!notification.read" class="unread-indicator"></div>
          </div>
        </div>
      </el-scrollbar>
      
      <div class="notifications-footer">
        <router-link to="/notifications/all" class="view-all-link">
          View all notifications
        </router-link>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Bell } from '@element-plus/icons-vue';
import { ElPopover, ElMenuItem, ElBadge, ElIcon, ElButton, ElScrollbar, ElSkeleton } from 'element-plus';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const notifications = ref<Notification[]>([]);
const loading = ref(false);

const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
);

const fetchNotifications = async () => {
  loading.value = true;
  try {
    // Replace with your actual API call
    const response = await fetch('/api/notifications?limit=10');
    const data = await response.json();
    notifications.value = data.data || [];
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  } finally {
    loading.value = false;
  }
};

const markAsRead = async (notification: Notification) => {
  if (notification.read) return;
  
  try {
    await fetch(`/api/notifications/${notification.id}/read`, {
      method: 'PATCH'
    });
    notification.read = true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
};

const markAllAsRead = async () => {
  try {
    await fetch('/api/notifications/mark-all-read', {
      method: 'PATCH'
    });
    notifications.value.forEach(n => n.read = true);
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
};

onMounted(() => {
  fetchNotifications();
  // Set up polling for new notifications
  setInterval(fetchNotifications, 30000); // Poll every 30 seconds
});
</script>

<style scoped>
.notification-menu-item {
  cursor: pointer;
}

.notifications-panel {
  padding: 0;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.notifications-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.loading-container {
  padding: 16px;
}

.empty-state {
  text-align: center;
  padding: 40px 16px;
  color: #909399;
}

.empty-state p {
  margin: 8px 0 0 0;
}

.notifications-list {
  padding: 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.unread {
  background-color: #f0f9ff;
}

.notification-content {
  flex: 1;
}

.notification-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.notification-message {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #409eff;
  margin-left: 8px;
  margin-top: 4px;
  flex-shrink: 0;
}

.notifications-footer {
  padding: 12px 16px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.view-all-link {
  color: #409eff;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.view-all-link:hover {
  text-decoration: underline;
}
</style>

<style>
.notifications-popover {
  padding: 0 !important;
}
</style>
