import { Component, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../../Services/chat.service';
import { AuthService } from '../../../Services/auth.service';
import { StorageService } from '../../../Services/storage.service';
import { Message, MessageType } from '../../../Models';
import { MessageInputComponent } from '../message-input/message-input.component';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, MessageInputComponent],
  templateUrl: './chat-room.component.html',
  styleUrl: './chat-room.component.css'
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  chatId = signal<string>('');
  messages = signal<Message[]>([]);
  currentUser = this.authService.currentUser$;
  loading = signal(true);

  constructor() {
    // Effect para suscribirse a los mensajes cuando cambia el chatId
    effect(() => {
      const id = this.chatId();
      if (id) {
        this.chatService.getChatMessages(id);
      }
    });
  }

  ngOnInit() {
    // Obtener el chatId de la URL
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.chatId.set(id);
      }
    });

    // Suscribirse a los mensajes
    this.chatService.messages$.subscribe(messagesMap => {
      const chatMessages = messagesMap[this.chatId()] || [];
      this.messages.set(chatMessages);
      this.loading.set(false);

      // Marcar mensajes como leídos
      const user = this.authService.getCurrentUser();
      if (user && chatMessages.length > 0) {
        this.markMessagesAsRead(user.uid);
      }

      // Scroll al final
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  async sendTextMessage(content: string) {
    if (!content.trim()) return;

    try {
      await this.chatService.sendTextMessage(this.chatId(), content);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  }

  async sendMediaMessage(file: File) {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      const messageType = this.storageService.getMessageTypeFromFile(file);
      
      // Subir archivo
      const { downloadURL, fileName, fileSize } = await this.storageService.uploadFile(
        file,
        this.chatId(),
        messageType
      );

      // Enviar mensaje
      await this.chatService.sendMessage({
        chatId: this.chatId(),
        senderId: user.uid,
        type: messageType,
        content: fileName,
        mediaURL: downloadURL,
        mediaName: fileName,
        mediaSize: fileSize
      });
    } catch (error) {
      console.error('Error al enviar archivo:', error);
    }
  }

  private markMessagesAsRead(userId: string) {
    this.chatService.markAllMessagesAsRead(this.chatId(), userId);
  }

  private scrollToBottom() {
    const container = document.querySelector('.messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  isOwnMessage(message: Message): boolean {
    const user = this.authService.getCurrentUser();
    return message.senderId === user?.uid;
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
    }
  }

  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;

    const currentMessage = this.messages()[index];
    const previousMessage = this.messages()[index - 1];

    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();

    return currentDate !== previousDate;
  }

  goBack() {
    this.router.navigate(['/chat']);
  }

  getMessageTypeIcon(type: MessageType): string {
    const icons: { [key: string]: string } = {
      image: '📷',
      audio: '🎵',
      video: '🎥',
      file: '📎'
    };
    return icons[type] || '';
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '';
    return this.storageService.formatFileSize(bytes);
  }
}
