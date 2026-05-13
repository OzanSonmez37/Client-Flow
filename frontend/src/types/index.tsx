export type UserRole = 'admin' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export type ProjectStatus = 'planning' | 'development' | 'testing' | 'completed' | 'on_hold';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  industry?: string;
  website?: string;
  notes?: string;
  isActive: boolean;
  projectCount?: number;
  projects?: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  budget?: number;
  startDate?: string;
  endDate?: string;
  teamMembers?: string[];
  priority?: string;
  clientId: string;
  client?: Client;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalClients: number;
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  statusDistribution: { status: ProjectStatus; count: number }[];
  recentProjects: Project[];
}

export interface TimelineData {
  month: string;
  label: string;
  budget: number;
  projects: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
}
