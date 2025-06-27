<template>
  <el-menu-item @click="searchHandler">
    <el-icon class="navbar-icon">
      <Search/>
    </el-icon>
  </el-menu-item>
</template>

<script setup lang="ts">
import { ElMenuItem, ElIcon } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

function searchHandler() {
  console.log("Searching");
}
</script>