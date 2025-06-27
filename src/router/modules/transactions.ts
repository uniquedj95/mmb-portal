import { RouteRecordRaw } from 'vue-router';
import Layout from '../../layout/index.vue';
import { CreditCard } from '@element-plus/icons-vue';

const TransactionsRoutes: RouteRecordRaw = {
  path: '/transactions',
  component: Layout,
  meta: {
    title: 'Transactions',
    icon: CreditCard,
  },
  children: [
    {
      path: '',
      component: () => import('../../views/transactions/TransactionsList.vue'),
      name: 'TransactionsList',
      meta: {
        title: 'All Transactions',
        roles: ['admin'],
      }
    },
    {
      path: 'pending',
      component: () => import('../../views/transactions/PendingTransactions.vue'),
      name: 'PendingTransactions',
      meta: {
        title: 'Pending Approval',
        roles: ['admin'],
      }
    },
    {
      path: 'deposits',
      component: () => import('../../views/transactions/Deposits.vue'),
      name: 'Deposits',
      meta: {
        title: 'Deposits',
        roles: ['admin'],
      }
    },
    {
      path: 'withdrawals',
      component: () => import('../../views/transactions/Withdrawals.vue'),
      name: 'Withdrawals',
      meta: {
        title: 'Withdrawals',
        roles: ['admin'],
      }
    }
  ]
};

export default TransactionsRoutes;
