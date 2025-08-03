import { RouteRecordRaw, createRouter, createWebHistory } from 'vue-router';
import Layout from "../layout/index.vue";
import useAuth from '../composables/useAuth';
import { Odometer } from '@element-plus/icons-vue';
import AccessRoutes from "./modules/auth";
import GroupsRoutes from "./modules/groups";
import TransactionsRoutes from "./modules/transactions";
import ReportsRoutes from "./modules/reports";

/*
  Note: sub-menu only appear when children.length>=1
*/

/*
  name:'router-name'             the name field is required
  path: 'router-path'            the path field is required
  meta: {
    roles: ['admin', 'editor']   will control the page roles (allow setting multiple roles)
    title: 'title'               the name showed in subMenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon showed in the sidebar
    hidden: true                 if true, this route will not show in the sidebar (default is false)
  }
*/
export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('../views/Dashboard.vue'),
        name: 'Dashboard',
        meta: {
          title: 'Dashboard',
          icon: Odometer,
        }
      },
      {
        path: 'notifications/all',
        component: () => import('../views/notifications/NotificationsList.vue'),
        name: 'AllNotifications',
        meta: {
          title: 'All Notifications',
          hidden: true
        }
      }
    ]
  },
  {
    path: "/login",
    component: () => import("../views/Login.vue"),
    meta: { hidden: true }
  },
  GroupsRoutes,
  TransactionsRoutes,
  ReportsRoutes,
  AccessRoutes,
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const { isAuthenticated } = useAuth();
  
  // Check authentication for protected routes
  if (!isAuthenticated.value && to.path !== '/login') {
    if (!isAuthenticated.value) {
      return next('/login');
    }
  }

  next();
})

export default router