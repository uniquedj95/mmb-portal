import api, { ApiRequestParam } from "../api";

export interface Transaction {
  id: number;
  transactionId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INTEREST' | 'LOAN_DISBURSEMENT' | 'LOAN_REPAYMENT' | 'SHARE_CONTRIBUTION';
  amount: number;
  accountId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  description: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: number;
  approvedAt?: string;
  rejectionReason?: string;
  account: {
    id: number;
    accountType: string;
    balance: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
    group: {
      id: number;
      name: string;
    };
  };
}

export default class TransactionService {
  // Get all transactions
  async getTransactions(params?: ApiRequestParam) {
    const response = await api.getJson<Transaction[]>('transactions', params);
    return response;
  }

  // Get pending transactions
  async getPendingTransactions() {
    const response = await api.getJson<Transaction[]>('transactions', { status: 'PENDING' });
    return response;
  }

  // Get deposits
  async getDeposits(params?: ApiRequestParam) {
    const response = await api.getJson<Transaction[]>('transactions', { ...params, type: 'DEPOSIT' });
    return response;
  }

  // Get withdrawals
  async getWithdrawals(params?: ApiRequestParam) {
    const response = await api.getJson<Transaction[]>('transactions', { ...params, type: 'WITHDRAWAL' });
    return response;
  }

  // Get transaction by ID
  async getTransactionById(id: number) {
    const response = await api.getJson<Transaction>(`/transactions/${id}`);
    return response;
  }

  // Approve transaction
  async approveTransaction(id: number) {
    const response = await api.patchJson(`/transactions/${id}/approve`, {});
    return response;
  }

  // Reject transaction
  async rejectTransaction(id: number, reason?: string) {
    const response = await api.patchJson(`/transactions/${id}/reject`, { reason });
    return response;
  }

  // Get transaction statistics
  async getTransactionStats(params?: ApiRequestParam) {
    const response = await api.getJson(`/transactions/stats`, params);
    return response.data;
  }
}
