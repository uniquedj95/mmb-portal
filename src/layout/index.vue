<template>
  <el-container class="layout-container">
    <top-nav />
    <el-container class="app-wrapper">
      <left-sidebar />
      <el-main class="main-content" :class="{ 'is-collapsed': collapsed }">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import LeftSidebar from './components/sidebar/LeftSidebar.vue';
import TopNav from './components/topnav/index.vue';
import { ElContainer, ElMain } from 'element-plus';
import { useSidebar } from '../composables/useSidebar';

const { collapsed } = useSidebar();
</script>

<style>
.layout-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-wrapper {
  height: calc(100vh - 60px);
  position: relative;
  margin-top: 60px;
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
  margin-left: 250px;
  transition: margin-left 0.3s;
  width: calc(100% - 250px);
  box-sizing: border-box;
}

.main-content.is-collapsed {
  margin-left: 64px;
  width: calc(100% - 64px);
}
</style>
