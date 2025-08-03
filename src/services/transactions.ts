import api, { ApiRequestParam } from "../api";

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'GROUP_CONTRIBUTION' | 'DIVIDEND' | 'DONATION' | 'ADMIN_FEE' | 'SOCIAL_FUND_CONTRIBUTION' | 'SOCIAL_FUND_DISBURSEMENT';
  amount: number;
  reference?: string;
  userWalletId?: string;
  groupWalletId?: string;
  userId: string;
  groupId?: string;
  loanId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'FAILED';
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    idType?: string;
    idNumber?: string;
    email?: string;
    phoneNumber: string;
    roleId?: string;
    verified?: boolean;
  };
  group?: {
    id: string;
    name: string;
  } | null;
  userWallet?: {
    id: string;
    userId: string;
    balance: number;
    walletType: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  groupWallet?: {
    id: string;
    balance: number;
    type: string;
  } | null;
  loan?: any | null;
}

export interface TransactionResponse {
  data: Transaction[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default class TransactionService {
  // Get all transactions
  async getTransactions(params?: ApiRequestParam) {
    const response = await api.getJson<TransactionResponse>('transactions', params);
    return response;
  }

  // Get pending transactions
  async getPendingTransactions() {
    const response = await api.getJson<TransactionResponse>('transactions', { status: 'PENDING' });
    return response;
  }

  // Get deposits
  async getDeposits(params?: ApiRequestParam) {
    const response = await api.getJson<TransactionResponse>('transactions', { ...params, type: 'DEPOSIT' });
    return response;
  }

  // Get withdrawals
  async getWithdrawals(params?: ApiRequestParam) {
    const response = await api.getJson<TransactionResponse>('transactions', { ...params, type: 'WITHDRAWAL' });
    return response;
  }

  // Get transaction by ID
  async getTransactionById(id: number) {
    const response = await api.getJson<Transaction>(`/transactions/${id}`);
    return response;
  }

  // Approve transaction
  async approveTransaction(id: string) {
    const response = await api.patchJson(`/transactions/${id}/approve`, {});
    return response;
  }

  // Reject transaction
  async rejectTransaction(id: string, reason?: string) {
    const response = await api.patchJson(`/transactions/${id}/reject`, { reason });
    return response;
  }

  // Get transaction statistics
  async getTransactionStats(params?: ApiRequestParam) {
    const response = await api.getJson(`/transactions/stats`, params);
    return response.data;
  }
}
