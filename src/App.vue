
<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import useAppSettings from './composables/useAppSettings';

const { size, popupZIndex } = useAppSettings();

</script>

<template>
  <ElConfigProvider :size="size" :z-index="popupZIndex">  
    <router-view />
  </ElConfigProvider>
</template>
