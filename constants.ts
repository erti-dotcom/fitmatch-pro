import { UserProfile, SportType, SkillLevel } from './types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'u2',
    email: 'sarah@example.com',
    name: 'Sarah Müller',
    age: 28,
    location: 'Berlin',
    bio: 'Ich trainiere für meinen ersten Hyrox Pro Wettkampf. Suche jemanden, der mich pusht!',
    sports: [SportType.HYROX, SportType.RUNNING, SportType.CROSSFIT],
    level: SkillLevel.PRO,
    frequency: 5,
    avatar: 'https://picsum.photos/seed/sarah/200/200',
  },
  {
    id: 'u3',
    email: 'tom@example.com',
    name: 'Tom Weber',
    age: 34,
    location: 'München',
    bio: 'Laufe gerne lange Distanzen am Wochenende. Suche Laufpartner für 10-15km Runden.',
    sports: [SportType.RUNNING, SportType.CYCLING],
    level: SkillLevel.INTERMEDIATE,
    frequency: 3,
    avatar: 'https://picsum.photos/seed/tom/200/200',
  },
  {
    id: 'u4',
    email: 'lisa@example.com',
    name: 'Lisa Chen',
    age: 25,
    location: 'Hamburg',
    bio: 'Yoga am Morgen, Gym am Abend. Suche entspannte Leute.',
    sports: [SportType.YOGA, SportType.GYM],
    level: SkillLevel.BEGINNER,
    frequency: 4,
    avatar: 'https://picsum.photos/seed/lisa/200/200',
  },
  {
    id: 'u5',
    email: 'markus@example.com',
    name: "Markus 'The Beast'",
    age: 30,
    location: 'Köln',
    bio: 'Alles oder nichts. Crossfit und Weightlifting.',
    sports: [SportType.CROSSFIT, SportType.GYM, SportType.HYROX],
    level: SkillLevel.COMPETITIVE,
    frequency: 6,
    avatar: 'https://picsum.photos/seed/markus/200/200',
  }
];

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'm1',
    senderId: 'u2',
    text: 'Hey! Lust mal zusammen für Hyrox zu trainieren?',
    timestamp: Date.now() - 100000,
  }
];