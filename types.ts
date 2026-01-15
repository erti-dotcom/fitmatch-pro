export enum SportType {
  RUNNING = 'Laufen',
  HYROX = 'Hyrox',
  CROSSFIT = 'Crossfit',
  GYM = 'Fitnessstudio',
  CYCLING = 'Radfahren',
  YOGA = 'Yoga',
  TENNIS = 'Tennis',
  OTHER = 'Andere'
}

export enum SkillLevel {
  BEGINNER = 'Anfänger',
  INTERMEDIATE = 'Fortgeschritten',
  PRO = 'Profi',
  COMPETITIVE = 'Wettkampf'
}

export interface ActivityLog {
  id: string;
  type: string;
  duration: number; // in minutes
  date: string; // ISO string
  notes?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  sports: SportType[];
  level: SkillLevel;
  frequency: number;
  avatar: string;
  // New Local Stats
  streak?: number;
  lastWorkout?: string;
  activityHistory?: ActivityLog[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface MatchRecommendation {
  score: number;
  reasoning: string;
  suggestedActivity: string;
}