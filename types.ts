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
  taggedUserIds?: string[]; // IDs of friends tagged in this workout
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
  // New Local Stats & Social
  streak?: number;
  lastWorkout?: string;
  activityHistory?: ActivityLog[];
  friends?: string[]; // List of User IDs allowed to be tagged
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

export interface DailyTip {
    title: string;
    text: string;
    category: string;
}