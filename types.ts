export enum SportType {
  RUNNING = 'Laufen',
  HYROX = 'Hyrox',
  CROSSFIT = 'Crossfit',
  GYM = 'Fitnessstudio',
  CYCLING = 'Radfahren',
  YOGA = 'Yoga',
  TENNIS = 'Tennis',
  SWIMMING = 'Schwimmen',
  OTHER = 'Andere'
}

export enum SkillLevel {
  BEGINNER = 'Anfänger',
  INTERMEDIATE = 'Fortgeschritten',
  PRO = 'Profi',
  COMPETITIVE = 'Wettkampf'
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: number;
}

export interface ActivityLog {
  id: string;
  userId: string; // New: Link activity to user
  type: string;
  duration: number; // in minutes
  date: string; // ISO string
  notes?: string;
  calories?: number;
  distance?: number; // km
  taggedUserIds?: string[]; 
  likes?: string[]; // Array of User IDs who liked this
  comments?: Comment[];
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
  
  // Social & Stats
  streak?: number;
  lastWorkout?: string;
  friends?: string[]; // IDs of people I follow
  followers?: string[]; // IDs of people following me (Mocked mostly)
  
  // Flattened history for easier access, though in real DB this is a separate table
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

export interface DailyTip {
    title: string;
    text: string;
    category: string;
}