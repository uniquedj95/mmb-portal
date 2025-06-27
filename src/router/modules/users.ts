import { RouteRecordRaw } from 'vue-router';
import Layout from '../../layout/index.vue';
import { User } from '@element-plus/icons-vue';

const UsersRoutes: RouteRecordRaw = {
  path: '/users',
  component: Layout,
  meta: {
    title: 'Users',
    icon: User,
  },
  children: [
    {
      path: '',
      component: () => import('../../views/users/UsersList.vue'),
      name: 'UsersList',
      meta: {
        title: 'All Users',
        roles: ['admin'],
      }
    },
    {
      path: ':id',
      component: () => import('../../views/users/UserDetails.vue'),
      name: 'UserDetails',
      meta: {
        title: 'User Details',
        hidden: true,
        roles: ['admin'],
      }
    }
  ]
};

export default UsersRoutes;
