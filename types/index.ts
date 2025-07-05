export interface Message {
  _id?: string;
  content: string;
  senderName: string;
  senderType: "user" | "admin";
  club: "BUCC" | "BURC" | "BUAC";
  conversationId: string;
  timestamp: Date;
}

export interface User {
  _id?: string;
  email: string;
  club: "BUCC" | "BURC" | "BUAC";
  role: string;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    name: string;
    type: "user" | "admin";
    club?: "BUCC" | "BURC" | "BUAC";
  }>;
  club: "BUCC" | "BURC" | "BUAC";
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
  club: "BUCC" | "BURC" | "BUAC";
}
