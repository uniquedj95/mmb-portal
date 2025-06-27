import { RouteRecordRaw } from 'vue-router';
import Layout from '../../layout/index.vue';
import { Document, Bell } from '@element-plus/icons-vue';

const ReportsRoutes: RouteRecordRaw = {
  path: '/reports',
  component: Layout,
  meta: {
    title: 'Reports',
    icon: Document,
  },
  children: [
    {
      path: '',
      component: () => import('../../views/reports/ReportsDashboard.vue'),
      name: 'ReportsDashboard',
      meta: {
        title: 'Reports Dashboard',
        roles: ['admin'],
      }
    },
    // {
    //   path: 'financial',
    //   component: () => import('../../views/reports/FinancialReports.vue'),
    //   name: 'FinancialReports',
    //   meta: {
    //     title: 'Financial Reports',
    //     roles: ['admin'],
    //   }
    // },
    // {
    //   path: 'audit',
    //   component: () => import('../../views/reports/AuditLogs.vue'),
    //   name: 'AuditLogs',
    //   meta: {
    //     title: 'Audit Logs',
    //     roles: ['admin'],
    //   }
    // }
  ]
};

const NotificationsRoutes: RouteRecordRaw = {
  path: '/notifications',
  component: Layout,
  redirect: '/notifications/list',
  meta: {
    title: 'Notifications',
    icon: Bell,
  },
  children: [
    {
      path: 'list',
      component: () => import('../../views/notifications/NotificationsList.vue'),
      name: 'NotificationsList',
      meta: {
        title: 'All Notifications',
        roles: ['admin'],
      }
    }
  ]
};

export { ReportsRoutes, NotificationsRoutes };
