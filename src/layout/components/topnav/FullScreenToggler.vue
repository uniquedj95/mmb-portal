<template>
  <el-menu-item @click="toggleFullscreen">
    <el-icon class="navbar-icon">
      <FullScreen />
    </el-icon>
  </el-menu-item>
</template>

<script setup lang="ts">
import { ElMenuItem, ElIcon } from 'element-plus';
import { FullScreen } from '@element-plus/icons-vue';
import screenfull from "screenfull";

function toggleFullscreen() {
  screenfull.toggle();
}
</script>