import api, { ApiRequestParam } from "../api";
import { Group } from "./groups";
import { Transaction } from "./transactions";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idType: string;
  idNumber: string;
  roleId: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  role: {
    id: number;
    name: string;
    description: string;
  };
}

export default class UserService {
  // Get all users
  async getUsers(params?: ApiRequestParam) {
    const users = await api.getJson<User[]>('users', params);
    return users;
  }

  // Get user by ID
  async getUserById(id: number) {
    const user = await api.getJson<User>(`/users/${id}`);
    return user;
  }

  // Update user status
  async updateUserStatus(id: number, status: string) {
    const response = await api.patchJson(`/users/${id}/status`, { status });
    return response;
  }

  // Get user groups
  async getUserGroups(userId: number) {
    const response = await api.getJson<Group[]>(`/users/${userId}/groups`);
    return response;
  }

  // Get user transactions
  async getUserTransactions(userId: number, params?: ApiRequestParam) {    
    const response = await api.getJson<Transaction[]>(`/users/${userId}/transactions`, params);
    return response;
  }

  // Get user statistics
  async getUserStats(userId: number) {
    const response = await api.getJson(`/users/${userId}/stats`);
    return response;
  }
}
