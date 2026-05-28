export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
  trustScore: TrustScore;
}

export interface TrustScore {
  score: number;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'new';
  onTimePayments: number;
  totalPayments: number;
  defaultCount: number;
  lateCount: number;
  history: TrustHistoryEntry[];
}

export interface TrustHistoryEntry {
  date: string;
  score: number;
  event: string;
  delta: number;
}

export type RoundStatus = 'active' | 'pending' | 'complete' | 'dissolved';
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'grace' | 'defaulted' | 'confirmed';

export interface Round {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  status: RoundStatus;
  createdAt: string;
  startDate: string;
  endDate?: string;
  members: RoundMember[];
  cycles: Cycle[];
  currentCycleIndex: number;
  adminId: string;
  myMemberId: string;
}

export interface RoundMember {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  payoutOrder: number;
  trustScore: number;
  currentPaymentStatus: PaymentStatus;
}

export interface Cycle {
  id: string;
  roundId: string;
  cycleNumber: number;
  recipientMemberId: string;
  dueDate: string;
  paidAt?: string;
  payments: Payment[];
  status: 'upcoming' | 'active' | 'complete';
}

export interface Payment {
  id: string;
  cycleId: string;
  memberId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt?: string;
  confirmedAt?: string;
  proofUrl?: string;
  proofType?: ProofType;
  note?: string;
  graceDeadline?: string;
}

export type ProofType = 'screenshot' | 'receipt' | 'photo' | 'transfer';

export type GoalStatus = 'active' | 'paused' | 'complete' | 'cancelled';
export type GoalType = 'solo' | 'group';
export type DepositFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string;
  status: GoalStatus;
  depositFrequency: DepositFrequency;
  suggestedDepositAmount: number;
  createdAt: string;
  members?: GoalMember[];
  deposits: GoalDeposit[];
  milestones: GoalMilestone[];
  targetAccount?: TargetAccount;
  adminId: string;
  myMemberId: string;
}

export interface GoalMember {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string;
  splitPercentage: number;
  targetAmount: number;
  currentAmount: number;
  trustScore: number;
}

export interface GoalDeposit {
  id: string;
  goalId: string;
  memberId: string;
  memberName: string;
  amount: number;
  currency: string;
  depositDate: string;
  recordedAt: string;
  proofUrl?: string;
  proofType?: ProofType;
  note?: string;
  status: 'pending' | 'confirmed';
}

export interface GoalMilestone {
  id: string;
  percentage: number;
  label: string;
  reachedAt?: string;
}

export interface TargetAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  type: 'savings' | 'checking' | 'mobile_money';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface NavigationParams {
  RoundDetail: { roundId: string };
  GoalDetail: { goalId: string };
  GoalDeposit: { goalId: string };
  ProofUpload: { roundId: string; cycleId: string };
  TrustScore: { userId?: string };
}
