import api, { ApiRequestParam } from "../api";

export interface Group {
  id: string; // API uses UUID strings, not numbers
  name: string;
  description: string;
  isActive: boolean; // API uses isActive instead of status
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  maxMembers: number;
  minMonthlyContribution: number;
  maxMonthlyContribution?: number;
  interestRate: number;
  rolloverInterestRate: number;
  dividendDate?: string;
  memberCount?: number; // This might be calculated/aggregated
  totalSavings?: number; // This might be calculated/aggregated
  totalLoans?: number; // This might be calculated/aggregated
  // Additional properties from API response
  owner?: {
    id: string;
    name: string;
    idType: string;
    idNumber: string;
    phoneNumber: string;
    email?: string;
    roleId: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  members?: GroupMember[];
  wallets?: Array<{
    id: string;
    groupId: string;
    type: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
  }>;
  loans?: Array<any>; // Define loan interface if needed
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  joinedAt: string;
  leftAt?: string;
  leftReason?: string;
  totalContributions: number;
  status: 'APPROVED' | 'PENDING' | 'REJECTED'; // Based on API response
  user: {
    id: string;
    name: string; // API uses single 'name' field, not firstName/lastName
    idType: string;
    idNumber: string;
    phoneNumber: string;
    email?: string;
    roleId: string;
    verified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export default class GroupService {
  // Get all groups
  async getGroups(params?: ApiRequestParam) {
    
    const groups = await api.getJson('groups', params);
    return groups;
  }

  // Get pending groups (filter by isActive=false for groups that need approval)
  async getPendingGroups() {
    const groups = await api.getJson('/groups?isActive=false');
    return groups;
  }

  // Get group by ID
  async getGroupById(id: string) {
    const group = await api.getJson(`/groups/${id}`);
    return group;
  }

  // Get group members
  async getGroupMembers(groupId: string) {
    const members = await api.getJson(`/groups/${groupId}/members`);
    return members;
  }

  // Approve group (set isActive to true)
  async approveGroup(id: string) {
    const response = await api.putJson(`/groups/${id}`, { isActive: true });
    return response.data;
  }

  // Reject group (set isActive to false)
  async rejectGroup(id: string, reason?: string) {
    const response = await api.putJson(`/groups/${id}`, { 
      isActive: false,
      ...(reason && { rejectionReason: reason })
    });
    return response.data;
  }

  // Update group 
  async updateGroup(id: string, updates: Partial<Group>) {
    const response = await api.putJson(`/groups/${id}`, updates);
    return response.data;
  }
}
