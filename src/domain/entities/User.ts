export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tokenBalance: number;
  isSuspended: boolean;
  createdAt: string;
}
