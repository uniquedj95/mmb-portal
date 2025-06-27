import api, { ApiRequestParam } from "../api";

export interface Group {
  id: number;
  name: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  ownerId: number;
  memberCount: number;
  totalSavings: number;
  totalLoans: number;
}

export interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  joinedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default class GroupService {
  // Get all groups
  async getGroups(params?: ApiRequestParam) {
    
    const groups = await api.getJson('groups', params);
    return groups;
  }

  // Get pending groups
  async getPendingGroups() {
    const groups = await api.getJson('/groups?status=PENDING');
    return groups;
  }

  // Get group by ID
  async getGroupById(id: number) {
    const group = await api.getJson(`/groups/${id}`);
    return group;
  }

  // Get group members
  async getGroupMembers(groupId: number) {
    const members = await api.getJson(`/groups/${groupId}/members`);
    return members;
  }

  // Approve group
  async approveGroup(id: number) {
    const response = await api.patchJson(`/groups/${id}/approve`, {});
    return response.data;
  }

  // Reject group
  async rejectGroup(id: number, reason?: string) {
    const response = await api.patchJson(`/groups/${id}/reject`, { reason });
    return response.data;
  }

  // Update group status
  async updateGroupStatus(id: number, status: string) {
    const response = await api.patchJson (`/groups/${id}/status`, { status });
    return response.data;
  }
}
