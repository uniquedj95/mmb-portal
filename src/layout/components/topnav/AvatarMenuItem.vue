<template>
  <el-sub-menu index="2">
    <template #title>{{ displayName }}</template>
    <template v-for="(submenuItem, index) in submenuItems" :key="index">
      <el-menu-item :index="`2-${index + 1}`" @click="submenuItem.action">
        <el-icon><component :is="submenuItem.icon" /></el-icon>
        <span>{{ submenuItem.label }}</span>
      </el-menu-item>
    </template>
  </el-sub-menu>
</template>

<script setup lang="ts">
import useAuth from '../../../composables/useAuth';
import { User, Lock, SwitchButton } from '@element-plus/icons-vue';
import { ElSubMenu, ElMenuItem, ElIcon } from 'element-plus';

const { displayName, logout } = useAuth();
const submenuItems = [
  {label: "Edit Profile", icon: User, action: () => console.log("Editing user profile")},
  {label: "Change Password", icon: Lock, action: () => console.log("Editing user profile")},
  {label: "Logout", icon: SwitchButton, action: logout }
]
</script>