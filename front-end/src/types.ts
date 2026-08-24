export type Role = 'student' | 'faculty' | 'admin' | 'super_admin';

export type Department = 
  | 'Electrical & Lighting'
  | 'Plumbing & Water Supply'
  | 'Civil & Infrastructure'
  | 'Housekeeping & Sanitation'
  | 'IT & AV Equipment'
  | 'HVAC & Air Conditioning'
  | 'Campus Security & Safety';

export type Category =
  | 'Electrical & Wiring'
  | 'Plumbing Leak / Water Issue'
  | 'Broken Furniture / Structural'
  | 'Washroom & Cleanliness'
  | 'Projector / Audio / Lab Equipment'
  | 'AC / Ventilation Malfunction'
  | 'Unsafe Walkway / Lighting Hazard'
  | 'Other Infrastructure';

export type IssueStatus = 'Reported' | 'Ongoing' | 'Finished';

export type PriorityLevel = 'Normal' | 'High';

export interface LocationHierarchy {
  building: string;
  floor: string;
  roomArea: string;
  landmarkDetails?: string;
}

export interface StatusTimelineEvent {
  id: string;
  status: IssueStatus;
  timestamp: string;
  note: string;
  updatedBy: string;
  userRole: string;
}

export interface IssueReport {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: Category;
  department: Department;
  location: LocationHierarchy;
  imageUrl?: string;
  status: IssueStatus;
  priority: PriorityLevel;
  upvotes: number;
  upvotedUserIds: string[];
  reportedBy: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'faculty';
    rollNumber?: string;
    department?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: StatusTimelineEvent[];
  assignedTo?: string;
  assignedAdminName?: string;
  escalatedAt?: string;
  isEscalated: boolean;
  commentsCount: number;
}

export interface NotificationItem {
  id: string;
  userId: string; // or 'super_admin' or 'dept_admin:DepartmentName'
  issueId?: string;
  ticketNumber?: string;
  type: 'status_change' | 'upvote_milestone' | 'new_report' | 'escalation' | 'duplicate_merged';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  linkAction?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  rollNumber?: string;
  department?: Department; // for admin
  avatarUrl?: string;
}

export interface CategoryEscalationConfig {
  category: Category;
  threshold: number;
  isSafetyCritical: boolean;
  description: string;
}

export interface EscalationConfig {
  defaultUpvoteThreshold: number;
  safetyCriticalThreshold: number;
  autoEscalateHours: number;
  categoryThresholds: Record<Category, number>;
}

export interface DuplicateCandidateMatch {
  existingIssue: IssueReport;
  score: number; // 0 to 100%
  similarityScore?: number;
  reasons: string[];
}
