<script setup lang="ts">
import { ElMenu, ElAside, ElScrollbar } from "element-plus";
import SidebarItem from "./SidebarItem.vue";
import { useSidebar } from "../../../composables/useSidebar";
import { routes } from "../../../router"
import { computed } from "vue";
import { useRoute } from "vue-router";

const { collapsed } = useSidebar();
const route = useRoute();
const activeMenu = computed(() => `${route.meta?.activeMenu ?? route.path}`);

</script>

<template>
  <el-aside :width="collapsed ? '64px' : '250px'" class="sidebar-container">
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        background-color="var(--background-color)"
        text-color="#fff"
        active-text-color="#ffd04b"
        :unique-opened="false"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
          :is-collapse="collapsed"
        />
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<style scoped>
.sidebar-container {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  height: calc(100vh - 60px);
  background-color: var(--background-color);
  transition: width 0.3s;
  z-index: 9;
  overflow: hidden;
}

.el-menu {
  border-right: none !important;
  height: 100%;
}

/* Override Element Plus menu styles for collapsed state */
:deep(.el-menu--collapse) {
  width: 64px !important;
}

:deep(.el-menu--collapse .el-sub-menu__title span) {
  display: none;
}

:deep(.el-menu--collapse .el-sub-menu__icon-arrow) {
  display: none;
}
</style>
