<template>
  <el-aside width="210px" class="right-sidebar-container">
    <el-scrollbar>
      <div class="right-sidebar-content">
        <h3>Recent Activities</h3>
        <el-timeline class="timeline-container">
          <el-timeline-item
            v-for="(activity, index) in recentActivities"
            :key="index"
            :timestamp="activity.timestamp"
            type="primary"
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-scrollbar>
  </el-aside>
</template>

<script setup lang="ts">
import { ElAside, ElScrollbar, ElTimeline, ElTimelineItem } from "element-plus";
import { useRecentActivities } from "../../../composables/useRecentActivities";

const { recentActivities } = useRecentActivities();
</script>

<style scoped>
.right-sidebar-container {
  position: fixed;
  top: 60px;
  right: 0;
  bottom: 0;
  height: calc(100vh - 60px);
  width: 210px;
  background-color: #ffffff;
  transition: width 0.3s;
  border-left: 1px solid #eee;
  overflow: hidden;
  z-index: 9;
  background: #f9f9f9;
}

.right-sidebar-content {
  padding: 16px;
}

h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #333;
}

.timeline-container {
  margin-left: -32px;
}

:deep(.el-timeline-item__node) {
  left: 0;
  background-color: #409eff; /* Element Plus primary color */
}

:deep(.el-timeline-item__content) {
  margin-left: 0px;
}
</style>
