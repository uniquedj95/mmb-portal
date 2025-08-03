// Main interfaces export file

export interface Subscription {
  id: string;
  userId: string;
  plan: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  amount: number;
  currency: string;
  start_date: string; // Keep snake_case to match API
  end_date?: string;   // Keep snake_case to match API
  startDate: string;   // Camel case for internal use
  endDate?: string;    // Camel case for internal use
  renewalDate?: string;
  isAutoRenewal: boolean;
  package_id?: string; // Add package_id
  createdAt: string;
  updatedAt: string;
}

export interface ListItemI {
  icon?: any;
  label: string;
  value: string | number;
}
