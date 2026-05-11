// src/types/index.ts

// ============================================================
// Model Interfaces (matching Prisma schema)
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  invitations?: Invitation[];
}

export interface Invitation {
  id: string;
  userId: string;
  slug: string;
  title: string;
  groomName: string;
  groomFullName: string | null;
  groomPhoto: string | null;
  groomFather: string | null;
  groomMother: string | null;
  groomChildOrder: string | null;
  brideName: string;
  brideFullName: string | null;
  bridePhoto: string | null;
  brideFather: string | null;
  brideMother: string | null;
  brideChildOrder: string | null;
  quoteText: string | null;
  quoteSource: string | null;
  quoteArabic: string | null;
  quoteLatin: string | null;
  akadDate: Date | null;
  akadTime: string | null;
  akadLocation: string | null;
  akadLocationName: string | null;
  akadMapsUrl: string | null;
  resepsiDate: Date | null;
  resepsiTime: string | null;
  resepsiLocation: string | null;
  resepsiLocationName: string | null;
  resepsiMapsUrl: string | null;
  eventDate: Date;
  eventTime: string | null;
  location: string | null;
  locationName: string | null;
  mapsUrl: string | null;
  description: string | null;
  musicUrl: string | null;
  hashtag: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  gallery?: Gallery[];
  comments?: Comment[];
  giftAccounts?: GiftAccount[];
  loveStories?: LoveStory[];
}

export interface LoveStory {
  id: string;
  invitationId: string;
  title: string;
  date: string | null;
  description: string;
  order: number;
  createdAt: Date;
  invitation?: Invitation;
}

export interface Gallery {
  id: string;
  invitationId: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
  invitation?: Invitation;
}

export interface Comment {
  id: string;
  invitationId: string;
  guestName: string;
  message: string;
  attendance: string;
  createdAt: Date;
  invitation?: Invitation;
}

export interface GiftAccount {
  id: string;
  invitationId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisUrl: string | null;
  createdAt: Date;
  invitation?: Invitation;
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================
// Countdown
// ============================================================

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

// ============================================================
// Form Types
// ============================================================

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface InvitationFormData {
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime?: string;
  location?: string;
  locationName?: string;
  mapsUrl?: string;
  description?: string;
}

export interface CommentFormData {
  guestName: string;
  message: string;
  attendance: "hadir" | "tidak_hadir" | "ragu";
}

export interface GiftAccountFormData {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  qrisUrl?: string;
}

// ============================================================
// Rate Limiter
// ============================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// ============================================================
// Auth / Session Types
// ============================================================

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}
