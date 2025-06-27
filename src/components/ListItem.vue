<template>
  <div :class="justify">
    <el-icon v-if="icon" class="mr-4" color="warning">
      <component :is="icon" />
    </el-icon>
    <el-text class="text" style="font-weight: 600; margin-right: 1rem;">
      {{ label }}:
    </el-text>
    <el-text class="text" > {{ value }} </el-text>
  </div>
  <el-divider class="m-2" />
</template>

<script setup lang="ts">
import { ElText, ElDivider, ElIcon } from "element-plus";
import { ListItemI } from "../interfaces";
import { computed } from "vue";

const props = defineProps<ListItemI>();

const justify = computed(() =>`justify-${props.placement ?? "start"}`)

</script>

<style>
.m-2 {
  padding: 0.5em !important;
}

.mr-2 {
  margin-right: 0.5em !important;
}

.mr-4 {
  margin-right: 1em !important;
}
</style>
