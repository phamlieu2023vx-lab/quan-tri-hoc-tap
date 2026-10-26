export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: 'teacher' | 'head_teacher' | 'admin';
  schoolName: string;
  className: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthSession {
  user: UserAccount;
  token: string;
  rememberMe: boolean;
}
