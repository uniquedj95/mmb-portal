import { RouteRecordRaw } from 'vue-router';
import Layout from '../../layout/index.vue';
import { User } from '@element-plus/icons-vue';

const GroupsRoutes: RouteRecordRaw = {
  path: '/groups',
  component: Layout,
  meta: {
    title: 'Groups',
    icon: User,
  },
  children: [
    {
      path: '',
      component: () => import('../../views/groups/GroupsList.vue'),
      name: 'GroupsList',
      meta: {
        title: 'All Groups',
        roles: ['admin'],
      }
    },
    {
      path: 'pending',
      component: () => import('../../views/groups/PendingGroups.vue'),
      name: 'PendingGroups',
      meta: {
        title: 'Pending Approval',
        roles: ['admin'],
      }
    },
    {
      path: ':id',
      component: () => import('../../views/groups/GroupDetails.vue'),
      name: 'GroupDetails',
      meta: {
        title: 'Group Details',
        hidden: true,
        roles: ['admin'],
      }
    }
  ]
};

export default GroupsRoutes;
