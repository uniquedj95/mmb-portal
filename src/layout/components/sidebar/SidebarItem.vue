<template>
  <div v-if="!item.meta || !item.meta.hidden" :class="[isCollapse ? 'simple-mode' : 'full-mode', { 'first-level': isFirstLevel }]">
    <template v-if="!alwaysShowRootMenu && theOnlyOneChild && !theOnlyOneChild.children">
      <router-link v-if="theOnlyOneChild.meta" :to="resolvePath(theOnlyOneChild.path)">
        <el-menu-item :index="resolvePath(theOnlyOneChild.path)" :class="{ 'submenu-title-noDropdown': isFirstLevel }">
          <el-icon v-if="theOnlyOneChild.meta.icon" :name="theOnlyOneChild.meta.icon">
            <component :is="resolveDynamicComponent(theOnlyOneChild.meta.icon)" />
          </el-icon>
          <template #title>
            <span v-if="theOnlyOneChild.meta.title">{{ theOnlyOneChild.meta.title }}</span>
          </template>
        </el-menu-item>
      </router-link>
    </template>
    <el-sub-menu v-else :index="resolvePath(item.path)" teleported>
      <template #title>
        <el-icon v-if="item.meta && item.meta.icon" >
          <component :is="resolveDynamicComponent(item.meta.icon)" />
        </el-icon>
        <span v-if="item.meta && item.meta.title">{{ item.meta.title }}</span>
      </template>
      <template v-if="item.children">
        <SidebarItem v-for="child in item.children" :key="child.path" :item="child" :isCollapse="isCollapse" :isFirstLevel="false" :base-path="resolvePath(child.path)" class="nest-menu" />
      </template>
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { PropType, computed, resolveDynamicComponent } from 'vue'
import { RouteRecordRaw } from 'vue-router'
import { ElMenuItem, ElIcon, ElSubMenu } from 'element-plus';
import { isExternal } from '../../../utils/validate';

const props = defineProps({
  item: {
    type: Object as PropType<RouteRecordRaw>,
      required: true
    },
    isCollapse: {
      type: Boolean,
      default: false
    },
    isFirstLevel: {
      type: Boolean,
      default: true
    },
  basePath: {
    type: String,
    default: ''
  }
})

const alwaysShowRootMenu = computed(() => !!(props.item.meta && props.item.meta.alwaysShow))
const showingChildNumber = computed(() => 
  props.item.children?.filter((item) => !(item.meta && item.meta.hidden)).length ?? 0
);

const theOnlyOneChild = computed(() => {
  if (showingChildNumber.value > 1) {
    return null
  }
  if (props.item.children) {
    for (const child of props.item.children) {
      if (!child.meta || !child.meta.hidden) {
        return child
      }
    }
  }
  return { ...props.item, path: '' }
})

function resolvePath (routePath: string) {
  if (isExternal(routePath)) return routePath;
  if (isExternal(props.basePath)) return props.basePath;
  const path = `${props.basePath}/${routePath}`;
  return "/" + path.split("/").filter(Boolean).join("/");
};
</script>

<style>
.el-submenu.is-active>.el-submenu__title {
  color: var(--subMenuActiveText) !important;
}

.full-mode .nest-menu .el-submenu>.el-submenu__title,
.full-mode .el-submenu .el-menu-item {
  min-width: var(--sideBarWidth) !important;
  background-color: var(--subMenuBg) !important;
}

.full-mode .nest-menu .el-submenu>.el-submenu__title:hover,
.full-mode .el-submenu .el-menu-item:hover {
  background-color: var(--subMenuHover) !important;
}

.simple-mode.first-level .submenu-title-noDropdown {
  padding: 0 !important;
  position: relative;
}

.simple-mode.first-level .submenu-title-noDropdown .el-tooltip {
  padding: 0 !important;
}

.simple-mode .el-submenu {
  overflow: hidden;
}

.simple-mode .el-submenu>.el-submenu__title {
  padding: 0px !important;
}

.simple-mode .el-submenu>.el-submenu__title .el-submenu__icon-arrow {
  display: none;
}

/* Add hover tooltip styles */
.el-menu--vertical .el-menu-item, 
.el-menu--vertical .el-submenu__title {
  position: relative;
}

/* Ensure icons are centered in collapsed mode */
.el-menu--collapse .el-menu-item .el-icon,
.el-menu--collapse .el-submenu__title .el-icon {
  margin: 0 auto;
}
</style>

<style scoped>
.svg-icon {
  margin-right: 16px;
}

.simple-mode .svg-icon {
  margin-left: 20px;
}
</style>
