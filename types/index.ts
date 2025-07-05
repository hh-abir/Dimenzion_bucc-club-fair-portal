export interface Message {
  _id?: string;
  content: string;
  senderName: string;
  senderType: "user" | "admin";
  club: string;
  conversationId: string;
  userId?: string;
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
    userId?: string;
  }>;
  club: string;
  fingerprint: string;
  userId: string;
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
  userId: string;
  club: string;
}
