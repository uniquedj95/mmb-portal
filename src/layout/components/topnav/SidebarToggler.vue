<template>
  <el-menu-item @click="toggleSidebar">
    <el-icon class="navbar-icon">
      <component :is="collapsed ? Expand : Fold" />
    </el-icon>
  </el-menu-item>
</template>

<script setup lang="ts">
import { Fold, Expand } from '@element-plus/icons-vue';
import { useSidebar } from '../../../composables/useSidebar';
import { ElMenuItem, ElIcon } from 'element-plus';

const { collapsed, toggleSidebar } = useSidebar();
</script>