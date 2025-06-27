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
          :class="{ 'notification-unread': !notification.isRead }"
          class="notification-item"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-content-wrapper">
            <div class="notification-icon" :class="notification.type">
              <el-icon>
                <component :is="getIconComponent(notification.type)"></component>
              </el-icon>
            </div>
            <div class="notification-content">
              <h3>{{ notification.title }}</h3>
              <p>{{ notification.message }}</p>
              <span class="timestamp">{{ formatDate(notification.timestamp) }}</span>
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
  ElIcon
} from 'element-plus'
import {
  Message,
  InfoFilled,
  Warning,
  SuccessFilled
} from '@element-plus/icons-vue'

const notifications = ref([])
const loading = ref(true)
const currentFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10

// Fetch notifications from API
const fetchNotifications = async () => {
  loading.value = true
  try {
    // Replace with actual API call
    const response = await new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: [
            { id: 1, title: 'New message', message: 'You have a new message from admin', timestamp: new Date(), isRead: false, type: 'message' },
            { id: 2, title: 'System update', message: 'System will be updated tomorrow', timestamp: new Date(Date.now() - 86400000), isRead: true, type: 'info' },
            { id: 3, title: 'Alert', message: 'Unusual activity detected on your account', timestamp: new Date(Date.now() - 172800000), isRead: false, type: 'warning' }
          ]
        })
      }, 500)
    })
    notifications.value = response.data
  } catch (error) {
    console.error('Error fetching notifications:', error)
  } finally {
    loading.value = false
  }
}

// Mark notification as read
const markAsRead = async (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification && !notification.isRead) {
    try {
      // await api.markAsRead(id)
      notification.isRead = true
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }
}

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    // await api.markAllAsRead()
    notifications.value = notifications.value.map(n => ({ ...n, isRead: true }))
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

// Delete notification
const deleteNotification = async (id) => {
  try {
    // await api.deleteNotification(id)
    notifications.value = notifications.value.filter(n => n.id !== id)
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

// Get icon component based on notification type
const getIconComponent = (type) => {
  switch (type) {
    case 'message': return Message
    case 'warning': return Warning
    case 'success': return SuccessFilled
    case 'info':
    default: return InfoFilled
  }
}

// Handle page change
const handlePageChange = (page) => {
  currentPage.value = page
}

// Computed properties
const filteredNotifications = computed(() => {
  let filtered = [...notifications.value]
  
  if (currentFilter.value === 'read') {
    filtered = filtered.filter(n => n.isRead)
  } else if (currentFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.isRead)
  }
  
  // Sort by date, newest first
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  
  // Apply pagination
  const startIdx = (currentPage.value - 1) * pageSize
  const endIdx = startIdx + pageSize
  return filtered.slice(startIdx, endIdx)
})

const totalPages = computed(() => {
  let filtered = [...notifications.value]
  
  if (currentFilter.value === 'read') {
    filtered = filtered.filter(n => n.isRead)
  } else if (currentFilter.value === 'unread') {
    filtered = filtered.filter(n => !n.isRead)
  }
  
  return Math.ceil(filtered.length / pageSize)
})

const hasUnread = computed(() => {
  return notifications.value.some(n => !n.isRead)
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
