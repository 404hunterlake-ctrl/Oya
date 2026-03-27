export type Role = 'client' | 'sabi' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  location: string;
  avatar?: string;
}

export interface SabiProfile {
  userId: string;
  skills: string[];
  rating: number;
  verified: boolean;
  hourlyRate: number;
  bio: string;
  completedJobs: number;
}

export type JobStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  clientId: string;
  sabiId: string;
  title: string;
  description: string;
  status: JobStatus;
  price: number;
  date: string;
}

// Mock Database
export const users: User[] = [
  { id: 'u1', name: 'Chidi Okafor', email: 'chidi@example.com', role: 'client', phone: '08012345678', location: 'Lagos' },
  { id: 'u2', name: 'Ngozi Eze', email: 'ngozi@example.com', role: 'sabi', phone: '08087654321', location: 'Abuja', avatar: 'https://picsum.photos/seed/ngozi/200/200' },
  { id: 'u3', name: 'Emeka Obi', email: 'emeka@example.com', role: 'sabi', phone: '08123456789', location: 'Lagos', avatar: 'https://picsum.photos/seed/emeka/200/200' },
  { id: 'u4', name: 'Admin Oya', email: 'admin@oya.com', role: 'admin', phone: '08000000000', location: 'Lagos' },
];

export const sabiProfiles: SabiProfile[] = [
  { userId: 'u2', skills: ['Plumbing', 'Pipe Fitting'], rating: 4.8, verified: true, hourlyRate: 5000, bio: 'Experienced plumber with 10 years of fixing leaks and installing pipes in Abuja.', completedJobs: 42 },
  { userId: 'u3', skills: ['Cleaning', 'Deep Cleaning'], rating: 4.5, verified: false, hourlyRate: 3000, bio: 'Meticulous cleaner for homes and offices. I leave your space sparkling.', completedJobs: 15 },
];

export const jobs: Job[] = [
  { id: 'j1', clientId: 'u1', sabiId: 'u2', title: 'Fix leaking sink', description: 'The kitchen sink is leaking heavily. Need it fixed ASAP.', status: 'completed', price: 15000, date: '2026-03-20T10:00:00Z' },
  { id: 'j2', clientId: 'u1', sabiId: 'u3', title: 'Post-construction cleaning', description: 'Need a deep clean of a newly renovated 3-bedroom flat.', status: 'pending', price: 25000, date: '2026-03-28T09:00:00Z' },
];

// Helper functions to simulate DB queries
export const getSabis = () => {
  return users.filter(u => u.role === 'sabi').map(u => ({
    ...u,
    profile: sabiProfiles.find(p => p.userId === u.id)
  }));
};

export const getJobsForUser = (userId: string, role: Role) => {
  if (role === 'client') return jobs.filter(j => j.clientId === userId);
  if (role === 'sabi') return jobs.filter(j => j.sabiId === userId);
  return jobs;
};

export const getAllUsers = () => users;
