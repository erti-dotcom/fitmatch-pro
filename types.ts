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

export interface UserProfile {
  id: string;
  email: string; // New field for auth
  name: string;
  age: number;
  location: string;
  bio: string;
  sports: SportType[];
  level: SkillLevel;
  frequency: number; // times per week
  avatar: string;
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