export interface Chat {
  id: string;
  participants: string[]; // Array de UIDs de usuarios
  participantsInfo: { [uid: string]: ParticipantInfo };
  createdBy: string;
  createdAt: number;
  lastMessage?: LastMessage;
  lastMessageAt?: number;
  isGroup: boolean;
  groupName?: string;
  groupPhotoURL?: string;
  unreadCount?: { [uid: string]: number };
}

export interface ParticipantInfo {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: string;
  joinedAt: number;
}

export interface LastMessage {
  senderId: string;
  senderName: string;
  content: string;
  type: string;
  timestamp: number;
}

export interface ChatInput {
  participants: string[];
  createdBy: string;
  isGroup?: boolean;
  groupName?: string;
  groupPhotoURL?: string;
}
