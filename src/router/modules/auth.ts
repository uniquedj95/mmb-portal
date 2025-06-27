import { RouteRecordRaw } from 'vue-router';
import Layout from "../../layout/index.vue";
import { Lock } from '@element-plus/icons-vue';

const authRoute: RouteRecordRaw = {
  path: "/access",
  component: Layout,
  name: 'Auth',
  meta: {
    title: 'Access Management',
    icon: Lock
  },
  children: [
    {
      path: 'users',
      component: () => import('../../views/access/Users.vue'),
      name: 'Users',
      meta: {
        title: 'Users',
        noCache: true
      }
    },
    {
      path: 'roles',
      component: () => import('../../views/access/Roles.vue'),
      name: 'Roles',
      meta: {
        title: 'Roles',
        noCache: true
      }
    },
  ]
}

export default authRoute;