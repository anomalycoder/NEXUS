export type AccountStatus = 'Active' | 'Frozen' | 'Flagged' | 'Safe';

export type Page = 'dashboard' | 'investigation' | 'settings' | 'search' | 'network' | 'workflow';

export interface TransactionHistoryItem {
  date: string;
  amount: number;
  isSpike: boolean;
}

export interface Account {
  id: string;
  userId: string;
  transactionId: string;
  ipAddress: string;
  name: string;
  entity: string;
  type: 'Individual' | 'Corporate' | 'Shell';
  riskScore: number;
  status: AccountStatus;
  volume: string; // Formatted string (e.g. "₹10Cr")
  volumeValue: number; // Raw numeric value (in Cr) for conversion
  flagCount: number;
  lastActive: string;
  // Visual coordinates for the graph
  x: number;
  y: number;
  isRingMember: boolean; // Part of the fraud ring
  connections: string[]; // IDs of connected accounts
  history: TransactionHistoryItem[]; // Historical data for graphs
}

export interface ChartDataPoint {
  name: string;
  value: number;
}