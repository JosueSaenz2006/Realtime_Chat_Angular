import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChatService } from '../../../Services/chat.service';
import { AuthService } from '../../../Services/auth.service';
import { Chat } from '../../../Models';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css'
})
export class ChatListComponent implements OnInit {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private router = inject(Router);

  chats = signal<Chat[]>([]);
  currentUser = this.authService.currentUser$;
  searchTerm = signal('');
  loading = signal(true);

  ngOnInit() {
    // Suscribirse a los cambios del usuario actual
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.chatService.getUserChats(user.uid);
      }
    });

    // Suscribirse a la lista de chats
    this.chatService.chats$.subscribe(chats => {
      this.chats.set(chats);
      this.loading.set(false);
    });
  }

  selectChat(chatId: string) {
    this.router.navigate(['/chat', chatId]);
  }

  getChatName(chat: Chat, currentUserId: string): string {
    if (chat.isGroup) {
      return chat.groupName || 'Chat Grupal';
    }

    // Para chats individuales, mostrar el nombre del otro participante
    const otherParticipant = chat.participants.find(uid => uid !== currentUserId);
    if (otherParticipant && chat.participantsInfo[otherParticipant]) {
      return chat.participantsInfo[otherParticipant].displayName;
    }

    return 'Chat';
  }

  getChatPhoto(chat: Chat, currentUserId: string): string {
    if (chat.isGroup && chat.groupPhotoURL) {
      return chat.groupPhotoURL;
    }

    const otherParticipant = chat.participants.find(uid => uid !== currentUserId);
    if (otherParticipant && chat.participantsInfo[otherParticipant]) {
      return chat.participantsInfo[otherParticipant].photoURL || '';
    }

    return '';
  }

  getLastMessagePreview(chat: Chat): string {
    if (!chat.lastMessage) {
      return 'No hay mensajes';
    }

    if (chat.lastMessage.type === 'text') {
      return chat.lastMessage.content;
    }

    const typeLabels: { [key: string]: string } = {
      image: '📷 Imagen',
      audio: '🎵 Audio',
      video: '🎥 Video',
      file: '📎 Archivo'
    };

    return typeLabels[chat.lastMessage.type] || 'Mensaje';
  }

  getUnreadCount(chat: Chat, currentUserId: string): number {
    return chat.unreadCount?.[currentUserId] || 0;
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  }
}
