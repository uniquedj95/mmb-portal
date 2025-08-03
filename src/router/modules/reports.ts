import { RouteRecordRaw } from 'vue-router';
import Layout from '../../layout/index.vue';
import { Document } from '@element-plus/icons-vue';

const ReportsRoutes: RouteRecordRaw = {
  path: '/reports',
  component: Layout,
  meta: {
    title: 'Reports',
    icon: Document,
  },
  children: [
    {
      path: 'financial',
      component: () => import('../../views/reports/FinancialReports.vue'),
      name: 'FinancialReports',
      meta: {
        title: 'Financial Reports',
        roles: ['admin'],
      }
    },
    {
      path: 'audit',
      component: () => import('../../views/reports/AuditLogs.vue'),
      name: 'AuditLogs',
      meta: {
        title: 'Audit Logs',
        roles: ['admin'],
      }
    }
  ]
};

export default ReportsRoutes;
