import { MessageType } from './message-type.enum';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  type: MessageType;
  content: string;
  mediaURL?: string;
  mediaName?: string;
  mediaSize?: number;
  timestamp: number;
  isRead: boolean;
  readAt?: number;
  isEdited?: boolean;
  editedAt?: number;
}

export interface MessageInput {
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaURL?: string;
  mediaName?: string;
  mediaSize?: number;
}
