<template>
  <el-card class="statistics-card" shadow="hover" :body-style="{ padding: '20px' }">
    <div class="card-content">
      <div class="icon-container" :style="{ backgroundColor: `rgba(${hexToRgb(color)}, 0.1)` }">
        <el-icon :size="24" :color="color">
          <component :is="resolvedIcon" />
        </el-icon>
      </div>
      <div class="stat-content">
        <h3>{{ title }}</h3>
        <el-statistic
          :value="value ?? 0"
          :value-style="{ color: color ?? '#409EFF', fontSize: '24px' }"
          :formatter="formatter"
        />
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { DashboardStatistic } from '../composables/useDashboard';

const props = defineProps<DashboardStatistic>();

// Map of icon names to their async components
const iconMap = new Map();

// Function to get or create an async component for an icon
const getIconComponent = (iconName: string) => {
  if (!iconMap.has(iconName)) {
    // Create a new async component for this icon
    const asyncComponent = defineAsyncComponent({
      loader: async () => {
        try {
          const module = await import('@element-plus/icons-vue');
          // Type assertion to access the icon by name
          const icon = module[iconName as keyof typeof module];
          if (!icon) {
            console.error(`Icon not found: ${iconName}`);
            // Return a fallback component or throw an error
            return module.InfoFilled; // Fallback to a common icon
          }
          return icon;
        } catch (error) {
          console.error(`Failed to load icon: ${iconName}`, error);
          // Return a fallback component
          const { InfoFilled } = await import('@element-plus/icons-vue');
          return InfoFilled;
        }
      },
      // Add loading and error states if needed
      delay: 0,
      timeout: 5000
    });

    // Store in the map for reuse
    iconMap.set(iconName, asyncComponent);
  }

  return iconMap.get(iconName);
};

// Computed property to get the resolved icon component
const resolvedIcon = computed(() => {
  if (!props.icon) return null;
  return getIconComponent(props.icon);
});

// Helper function to convert hex color to RGB for the background
const hexToRgb = (hex: string) => {
  // Remove the hash if it exists
  hex = hex.replace(/^#/, '');

  // Parse the hex values
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  return `${r}, ${g}, ${b}`;
};
</script>

<style scoped>
.statistics-card {
  transition: all 0.3s ease;
}

.statistics-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  color: #606266;
}
</style>
