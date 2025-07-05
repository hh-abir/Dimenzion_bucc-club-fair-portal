export interface Message {
  _id?: string;
  content: string;
  senderName: string;
  senderType: "user" | "admin";
  club: string;
  conversationId: string;
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
  }>;
  club: string;
  fingerprint: string; // Added the missing fingerprint property
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
  club: string;
}
