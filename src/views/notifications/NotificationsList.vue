<template>
  <div class="notifications-container">
    <h1>Notifications</h1>
    
    <div class="filter-controls">
      <div class="filter-buttons">
        <el-button-group>
          <el-button 
            @click="currentFilter = 'all'" 
            :type="currentFilter === 'all' ? 'primary' : ''"
          >
            All
          </el-button>
          <el-button 
            @click="currentFilter = 'unread'" 
            :type="currentFilter === 'unread' ? 'primary' : ''"
          >
            Unread
          </el-button>
          <el-button 
            @click="currentFilter = 'read'" 
            :type="currentFilter === 'read' ? 'primary' : ''"
          >
            Read
          </el-button>
        </el-button-group>
        
        <el-button v-if="hasUnread" @click="markAllAsRead" type="info">
          Mark all as read
        </el-button>
      </div>
    </div>
    
    <el-empty v-if="filteredNotifications.length === 0 && !loading" description="No notifications found" />
    
    <el-card v-else v-loading="loading">
      <el-list v-if="!loading">
        <el-card
          v-for="notification in filteredNotifications" 
          :key="notification.id"
          shadow="hover"
          :class="{ 'notification-unread': !notification.read }"
          class="notification-item"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-content-wrapper">
            <div class="notification-icon" :class="getNotificationTypeClass(notification.type)">
              <el-icon>
                <component :is="getIconComponent(notification.type)"></component>
              </el-icon>
            </div>
            <div class="notification-content">
              <h3>{{ notification.title }}</h3>
              <p>{{ notification.message }}</p>
              <span class="timestamp">{{ formatDate(notification.createdAt) }}</span>
            </div>
            <div class="notification-actions">
              <el-button @click.stop="deleteNotification(notification.id)" type="danger" size="small">
                Delete
              </el-button>
            </div>
          </div>
        </el-card>
      </el-list>
    </el-card>
    
    <div v-if="totalPages > 1" class="pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :page-count="totalPages"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ElButton, 
  ElButtonGroup, 
  ElCard, 
  ElEmpty, 
  ElPagination, 
  ElIcon,
  ElMessage
} from 'element-plus'
import {
  Message,
  InfoFilled,
  Warning,
  SuccessFilled
} from '@element-plus/icons-vue'
import NotificationService, { type Notification } from '../../services/notifications'

const notifications = ref<Notification[]>([])
const loading = ref(true)
const currentFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10

const notificationService = new NotificationService()

// Fetch notifications from API
const fetchNotifications = async () => {
  loading.value = true
  try {
    const response = await notificationService.getNotifications({
      limit: 100, // Get more for local filtering
      offset: 0
    })
    notifications.value = response.data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    ElMessage.error('Failed to fetch notifications')
  } finally {
    loading.value = false
  }
}

// Mark notification as read
const markAsRead = async (id: string) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification && !notification.read) {
    try {
      await notificationService.markAsRead(id)
      notification.read = true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      ElMessage.error('Failed to mark notification as read')
    }
  }
}

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    await notificationService.markAllAsRead()
    notifications.value = notifications.value.map(n => ({ ...n, read: true }))
    ElMessage.success('All notifications marked as read')
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    ElMessage.error('Failed to mark all notifications as read')
  }
}

// Delete notification
const deleteNotification = async (id: string) => {
  try {
    await notificationService.deleteNotification(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
    ElMessage.success('Notification deleted successfully')
  } catch (error) {
    console.error('Error deleting notification:', error)
    ElMessage.error('Failed to delete notification')
  }
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// Get icon component based on notification type
const getIconComponent = (type: string) => {
  switch (type) {
    case 'SAVINGS_REMINDER': return Message
    case 'LOAN_APPROVAL': return SuccessFilled
    case 'REPAYMENT_DUE': return Warning
    case 'GROUP_UPDATE': return InfoFilled
    case 'DONOR_REPORT': return InfoFilled
    default: return InfoFilled
  }
}

// Get CSS class for notification type
const getNotificationTypeClass = (type: string) => {
  switch (type) {
    case 'SAVINGS_REMINDER': return 'message'
    case 'LOAN_APPROVAL': return 'success'
    case 'REPAYMENT_DUE': return 'warning'
    case 'GROUP_UPDATE': return 'info'
    case 'DONOR_REPORT': return 'info'
    default: return 'info'
  }
}

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// Computed properties
const filteredNotifications = computed(() => {
  let filtered = [...notifications.value]
  
  if (currentFilter.value === 'read') {
    filtered = filtered.filter(n => n.read)
  } else if (currentFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.read)
  }
  
  // Sort by date, newest first
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  // Apply pagination
  const startIdx = (currentPage.value - 1) * pageSize
  const endIdx = startIdx + pageSize
  return filtered.slice(startIdx, endIdx)
})

const totalPages = computed(() => {
  let filtered = [...notifications.value]
  
  if (currentFilter.value === 'read') {
    filtered = filtered.filter(n => n.read)
  } else if (currentFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.read)
  }
  
  return Math.ceil(filtered.length / pageSize)
})

const hasUnread = computed(() => {
  return notifications.value.some(n => !n.read)
})

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notifications-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notification-item {
  margin-bottom: 10px;
}

.notification-item.notification-unread {
  border-left: 3px solid var(--el-color-primary);
}

.notification-content-wrapper {
  display: flex;
  align-items: center;
}

.notification-icon {
  margin-right: 15px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.warning {
  background-color: #fff3cd;
  color: #856404;
}

.notification-icon.success {
  background-color: #d4edda;
  color: #155724;
}

.notification-icon.info {
  background-color: #d1ecf1;
  color: #0c5460;
}

.notification-icon.message {
  background-color: #e2e3ff;
  color: #3f51b5;
}

.notification-content {
  flex-grow: 1;
}

.notification-content h3 {
  margin: 0 0 5px;
  font-size: 16px;
}

.notification-content p {
  margin: 0 0 5px;
  color: #555;
}

.timestamp {
  font-size: 12px;
  color: #888;
}

.notification-actions {
  align-self: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
