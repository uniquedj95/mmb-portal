<script setup lang="ts">
import { ElHeader, ElMenu, ElMenuItem, ElDivider } from "element-plus";
import AvatarMenuItem from "./AvatarMenuItem.vue";
import SidebarToggler from "./SidebarToggler.vue";
import FullScreenToggler from "./FullScreenToggler.vue";
import SearchButton from "./SearchButton.vue";
</script>

<template>
  <el-header style="padding: 0 !important;">
    <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false">
      <sidebar-toggler />
      <el-menu-item>
        <router-link key="collapse" class="sidebar-logo-link" to="/">
          <img src="/assets/images/logo.png" height="48px">
        </router-link>
      </el-menu-item>
      <el-menu-item>
        <h3 class="app-title">Mizu Admin</h3>
      </el-menu-item>
      <div class="flex-grow"></div>
      <search-button />
      <full-screen-toggler />
      <el-divider direction="vertical" style="font-size: 58px; margin: 0;"/>
      <avatar-menu-item />
    </el-menu>
  </el-header>
</template>

<style scoped>
.flex-grow {
  flex-grow: 1;
}

.el-header {
  height: 60px !important;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.el-menu {
  height: 60px;
}
</style>