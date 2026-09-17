export type MemoryCategory = 
  | 'Special'
  | 'Travel'
  | 'Birthday'
  | 'Festival'
  | 'Funny'
  | 'Everyday'
  | 'Achievement'
  | 'Other';

export type MemoryMood = 
  | 'Love'
  | 'Peaceful'
  | 'Magical'
  | 'Emotional'
  | 'Adventure'
  | 'Celebration'
  | 'Funny';

export interface MemoryReaction {
  id: string;
  emoji: string;
  label: string;
  userName: string;
  createdAt: string;
}

export interface Memory {
  id: string;
  userId: string;
  creatorName: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  photos: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  mood: MemoryMood;
  category: MemoryCategory;
  tags: string[];
  isFavorite: boolean;
  isPrivate: boolean; // if true, only visible to creator
  voiceNoteUrl?: string; // audio recording
  voiceNoteDuration?: number; // seconds
  songTitle?: string;
  songUrl?: string;
  reactions: MemoryReaction[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  photos: string[];
  photoUrl?: string;
  location?: string;
  category: string;
  tags: string[];
  voiceNoteUrl?: string;
  songTitle?: string;
  songUrl?: string;
  isMilestone: boolean;
  userId: string;
  createdAt: string;
}

export interface PlaceMemory {
  id: string;
  name: string;
  location: string;
  country?: string;
  latitude: number;
  longitude: number;
  date: string;
  visitDate?: string;
  coverImage: string;
  photos: string[];
  notes: string;
  relatedMemoryIds: string[];
  userId: string;
  isVisited: boolean;
  createdAt: string;
}

export interface FutureLetter {
  id: string;
  title: string;
  message: string;
  content?: string;
  senderName: string;
  senderId: string;
  recipientName: string;
  createdDate: string;
  unlockDate: string; // ISO string or YYYY-MM-DD
  photoUrl?: string;
  voiceNoteUrl?: string;
  songTitle?: string;
  songUrl?: string;
  isOpened: boolean;
  openedAt?: string;
  sealColor?: string;
  createdAt: string;
}

export interface MemoryCapsule {
  id: string;
  title: string;
  theme: string;
  description?: string;
  createdDate: string;
  unlockDate: string;
  creatorName: string;
  creatorId: string;
  photos: string[];
  coverImage?: string;
  message: string;
  notes?: string[];
  links?: { title: string; url: string }[];
  voiceNoteUrl?: string;
  songTitle?: string;
  songUrl?: string;
  isUnlocked: boolean;
  isSealed?: boolean;
  mediaCount?: number;
  notesCount?: number;
  createdAt: string;
}

export interface BucketListItem {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  notes?: string;
  targetDate?: string;
  category: string;
  isCompleted: boolean;
  completedDate?: string;
  completedPhoto?: string;
  relatedMemoryIds?: string[];
  addedBy?: string;
  createdAt: string;
}

export interface CountdownEvent {
  id: string;
  userId?: string;
  title: string;
  targetDate: string; // YYYY-MM-DD or ISO
  category: string;
  description?: string;
  isRecurringYearly?: boolean;
  notes?: string;
  coverImage?: string;
  createdAt: string;
}

export type MilestoneCountdown = CountdownEvent;

export interface CoupleProfile {
  name: string;
  partnerName: string;
  anniversaryDate: string;
  meetingDate: string;
  avatarUrl?: string;
  partnerAvatarUrl?: string;
  vaultPasscode?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  partnerName: string;
  relationshipStartDate: string; // e.g. "2022-04-18"
  avatarUrl?: string;
  partnerAvatarUrl?: string;
  anniversaryTitle?: string;
  anniversaryDate?: string;
  meetingDate?: string;
  vaultPasscode?: string;
  customQuote?: string;
  role?: 'admin' | 'user';
}

export interface SpecialDate {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: string;
  description?: string;
  isReminderEnabled: boolean;
  isVisibleOnHome: boolean;
  createdAt: string;
}

export interface HomepageCms {
  heroHeading: string;
  tagline: string;
  introText: string;
  featuredMemoryId?: string;
  featuredStoryId?: string;
  showStats: boolean;
  showOnThisDay: boolean;
  showUpcomingCountdown: boolean;
  enterStoryCta: string;
  addMemoryCta: string;
  rediscoverCta: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: 'create' | 'update' | 'delete' | 'reorder' | 'config';
  entity: 'Memory' | 'Timeline' | 'Letter' | 'Capsule' | 'Place' | 'BucketList' | 'Countdown' | 'SpecialDate' | 'Category' | 'Mood' | 'HomepageCMS' | 'Theme' | 'Vault';
  entityId?: string;
  entityTitle?: string;
  adminUser: string;
  summary: string;
  timestamp: string;
}

export interface AdminMediaItem {
  id: string;
  name?: string;
  fileName?: string;
  url: string;
  sizeBytes?: number;
  size?: string;
  dimensions?: string;
  mimeType?: string;
  uploadedAt: string;
  usedIn: string[];
}

export interface CategoryItem {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

export interface MoodItem {
  id: string;
  name: string;
  emoji: string;
  color?: string;
  description?: string;
}

export type ActiveTab = 
  | 'home'
  | 'timeline'
  | 'story'
  | 'memories'
  | 'places'
  | 'letters'
  | 'capsules'
  | 'calendar'
  | 'bucketlist'
  | 'future'
  | 'replay'
  | 'year'
  | 'recap'
  | 'settings'
  | 'admin';
