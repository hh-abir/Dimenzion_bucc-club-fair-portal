export interface Message {
  _id?: string;
  content: string;
  senderName: string;
  senderType: "user" | "admin";
  club: string;
  conversationId: string;
  userId?: string; // Add userId field
  timestamp: Date;
}

export interface User {
  _id?: string;
  email: string;
  club: string;
  role: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    name: string;
    type: "user" | "admin";
    club?: string;
    userId?: string; // Add userId for participants
  }>;
  club: string;
  fingerprint: string;
  userId: string; // Add userId to conversation
  lastMessage?: {
    content: string;
    timestamp: Date;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  userName: string;
  userId: string; // Add userId
  club: string;
}
