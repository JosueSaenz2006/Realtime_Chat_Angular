import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Chat, ChatInput, Message, MessageInput, MessageType, ParticipantInfo } from '../Models';
import { AuthService } from './auth.service';
import { DATABASE_TOKEN } from '../app/firebase.providers';

// Nota: Debes instalar Firebase con: npm install firebase
// import { Database, ref, push, set, get, update, onValue, query, orderByChild, limitToLast, remove } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private authService = inject(AuthService);
  
  // Descomentar cuando instales Firebase
  // private database = inject(DATABASE_TOKEN);

  private chatsSubject = new BehaviorSubject<Chat[]>([]);
  public chats$ = this.chatsSubject.asObservable();

  private messagesSubject = new BehaviorSubject<{ [chatId: string]: Message[] }>({});
  public messages$ = this.messagesSubject.asObservable();

  constructor() {}

  /**
   * Crea un nuevo chat entre usuarios
   */
  async createChat(chatInput: ChatInput): Promise<Chat> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Debes estar autenticado para crear un chat');
      }

      // Descomentar cuando instales Firebase
      /*
      const chatsRef = ref(this.database, 'chats');
      const newChatRef = push(chatsRef);
      const chatId = newChatRef.key!;

      // Obtener información de los participantes
      const participantsInfo: { [uid: string]: ParticipantInfo } = {};
      for (const uid of chatInput.participants) {
        const userData = await this.authService.getUserData(uid);
        participantsInfo[uid] = {
          uid: userData.uid,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          role: userData.role,
          joinedAt: Date.now()
        };
      }

      const newChat: Chat = {
        id: chatId,
        participants: chatInput.participants,
        participantsInfo,
        createdBy: chatInput.createdBy,
        createdAt: Date.now(),
        isGroup: chatInput.isGroup || false,
        groupName: chatInput.groupName,
        groupPhotoURL: chatInput.groupPhotoURL,
        unreadCount: {}
      };

      // Inicializar contador de no leídos para cada participante
      chatInput.participants.forEach(uid => {
        newChat.unreadCount![uid] = 0;
      });

      await set(newChatRef, newChat);
      return newChat;
      */

      // Implementación temporal sin Firebase
      throw new Error('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      throw new Error(`Error al crear chat: ${error.message}`);
    }
  }

  /**
   * Obtiene todos los chats del usuario actual
   */
  getUserChats(userId: string): void {
    try {
      // Descomentar cuando instales Firebase
      /*
      const chatsRef = ref(this.database, 'chats');
      
      onValue(chatsRef, (snapshot) => {
        const chatsData = snapshot.val();
        if (chatsData) {
          const userChats: Chat[] = [];
          
          Object.keys(chatsData).forEach(chatId => {
            const chat = chatsData[chatId];
            if (chat.participants.includes(userId)) {
              userChats.push({ ...chat, id: chatId });
            }
          });

          // Ordenar por último mensaje
          userChats.sort((a, b) => (b.lastMessageAt || b.createdAt) - (a.lastMessageAt || a.createdAt));
          
          this.chatsSubject.next(userChats);
        } else {
          this.chatsSubject.next([]);
        }
      });
      */
      
      console.warn('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      console.error('Error al obtener chats:', error);
    }
  }

  /**
   * Envía un mensaje de texto
   */
  async sendTextMessage(chatId: string, content: string): Promise<void> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('Debes estar autenticado para enviar mensajes');
    }

    const messageInput: MessageInput = {
      chatId,
      senderId: currentUser.uid,
      type: MessageType.TEXT,
      content
    };

    await this.sendMessage(messageInput);
  }

  /**
   * Envía un mensaje (genérico para cualquier tipo)
   */
  async sendMessage(messageInput: MessageInput): Promise<Message> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Debes estar autenticado para enviar mensajes');
      }

      // Descomentar cuando instales Firebase
      /*
      const messagesRef = ref(this.database, `messages/${messageInput.chatId}`);
      const newMessageRef = push(messagesRef);
      const messageId = newMessageRef.key!;

      const newMessage: Message = {
        id: messageId,
        chatId: messageInput.chatId,
        senderId: messageInput.senderId,
        senderName: currentUser.displayName,
        senderPhotoURL: currentUser.photoURL,
        type: messageInput.type,
        content: messageInput.content,
        mediaURL: messageInput.mediaURL,
        mediaName: messageInput.mediaName,
        mediaSize: messageInput.mediaSize,
        timestamp: Date.now(),
        isRead: false
      };

      await set(newMessageRef, newMessage);

      // Actualizar último mensaje del chat
      await this.updateLastMessage(messageInput.chatId, newMessage);

      // Incrementar contador de no leídos para otros participantes
      await this.incrementUnreadCount(messageInput.chatId, currentUser.uid);

      return newMessage;
      */

      // Implementación temporal sin Firebase
      throw new Error('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      throw new Error(`Error al enviar mensaje: ${error.message}`);
    }
  }

  /**
   * Obtiene los mensajes de un chat en tiempo real
   */
  getChatMessages(chatId: string, limit: number = 50): void {
    try {
      // Descomentar cuando instales Firebase
      /*
      const messagesRef = ref(this.database, `messages/${chatId}`);
      const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(limit));

      onValue(messagesQuery, (snapshot) => {
        const messagesData = snapshot.val();
        const messages: Message[] = [];

        if (messagesData) {
          Object.keys(messagesData).forEach(messageId => {
            messages.push({ ...messagesData[messageId], id: messageId });
          });

          // Ordenar por timestamp
          messages.sort((a, b) => a.timestamp - b.timestamp);
        }

        const currentMessages = this.messagesSubject.value;
        this.messagesSubject.next({
          ...currentMessages,
          [chatId]: messages
        });
      });
      */

      console.warn('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      console.error('Error al obtener mensajes:', error);
    }
  }

  /**
   * Marca un mensaje como leído
   */
  async markMessageAsRead(chatId: string, messageId: string, userId: string): Promise<void> {
    try {
      // Descomentar cuando instales Firebase
      /*
      const messageRef = ref(this.database, `messages/${chatId}/${messageId}`);
      await update(messageRef, {
        isRead: true,
        readAt: Date.now()
      });

      // Decrementar contador de no leídos
      await this.decrementUnreadCount(chatId, userId);
      */
    } catch (error: any) {
      console.error('Error al marcar mensaje como leído:', error);
    }
  }

  /**
   * Marca todos los mensajes de un chat como leídos
   */
  async markAllMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      // Descomentar cuando instales Firebase
      /*
      const messagesRef = ref(this.database, `messages/${chatId}`);
      const snapshot = await get(messagesRef);

      if (snapshot.exists()) {
        const updates: any = {};
        const messagesData = snapshot.val();

        Object.keys(messagesData).forEach(messageId => {
          const message = messagesData[messageId];
          if (message.senderId !== userId && !message.isRead) {
            updates[`${messageId}/isRead`] = true;
            updates[`${messageId}/readAt`] = Date.now();
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(messagesRef, updates);
        }

        // Resetear contador de no leídos
        const chatRef = ref(this.database, `chats/${chatId}/unreadCount/${userId}`);
        await set(chatRef, 0);
      }
      */
    } catch (error: any) {
      console.error('Error al marcar todos los mensajes como leídos:', error);
    }
  }

  /**
   * Edita un mensaje existente
   */
  async editMessage(chatId: string, messageId: string, newContent: string): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Debes estar autenticado para editar mensajes');
      }

      // Descomentar cuando instales Firebase
      /*
      const messageRef = ref(this.database, `messages/${chatId}/${messageId}`);
      const snapshot = await get(messageRef);

      if (snapshot.exists()) {
        const message = snapshot.val();
        if (message.senderId !== currentUser.uid) {
          throw new Error('Solo puedes editar tus propios mensajes');
        }

        await update(messageRef, {
          content: newContent,
          isEdited: true,
          editedAt: Date.now()
        });
      }
      */

      // Implementación temporal sin Firebase
      throw new Error('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      throw new Error(`Error al editar mensaje: ${error.message}`);
    }
  }

  /**
   * Elimina un mensaje
   */
  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Debes estar autenticado para eliminar mensajes');
      }

      // Descomentar cuando instales Firebase
      /*
      const messageRef = ref(this.database, `messages/${chatId}/${messageId}`);
      const snapshot = await get(messageRef);

      if (snapshot.exists()) {
        const message = snapshot.val();
        if (message.senderId !== currentUser.uid && !this.authService.isAdmin()) {
          throw new Error('Solo puedes eliminar tus propios mensajes');
        }

        await remove(messageRef);
      }
      */

      // Implementación temporal sin Firebase
      throw new Error('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      throw new Error(`Error al eliminar mensaje: ${error.message}`);
    }
  }

  /**
   * Actualiza el último mensaje del chat
   */
  private async updateLastMessage(chatId: string, message: Message): Promise<void> {
    try {
      // Descomentar cuando instales Firebase
      /*
      const chatRef = ref(this.database, `chats/${chatId}`);
      await update(chatRef, {
        lastMessage: {
          senderId: message.senderId,
          senderName: message.senderName,
          content: message.content,
          type: message.type,
          timestamp: message.timestamp
        },
        lastMessageAt: message.timestamp
      });
      */
    } catch (error: any) {
      console.error('Error al actualizar último mensaje:', error);
    }
  }

  /**
   * Incrementa el contador de mensajes no leídos
   */
  private async incrementUnreadCount(chatId: string, senderId: string): Promise<void> {
    try {
      // Descomentar cuando instales Firebase
      /*
      const chatRef = ref(this.database, `chats/${chatId}`);
      const snapshot = await get(chatRef);

      if (snapshot.exists()) {
        const chat = snapshot.val();
        const updates: any = {};

        chat.participants.forEach((uid: string) => {
          if (uid !== senderId) {
            const currentCount = chat.unreadCount?.[uid] || 0;
            updates[`unreadCount/${uid}`] = currentCount + 1;
          }
        });

        if (Object.keys(updates).length > 0) {
          await update(chatRef, updates);
        }
      }
      */
    } catch (error: any) {
      console.error('Error al incrementar contador de no leídos:', error);
    }
  }

  /**
   * Decrementa el contador de mensajes no leídos
   */
  private async decrementUnreadCount(chatId: string, userId: string): Promise<void> {
    try {
      // Descomentar cuando instales Firebase
      /*
      const chatRef = ref(this.database, `chats/${chatId}`);
      const snapshot = await get(chatRef);

      if (snapshot.exists()) {
        const chat = snapshot.val();
        const currentCount = chat.unreadCount?.[userId] || 0;
        
        if (currentCount > 0) {
          await update(chatRef, {
            [`unreadCount/${userId}`]: currentCount - 1
          });
        }
      }
      */
    } catch (error: any) {
      console.error('Error al decrementar contador de no leídos:', error);
    }
  }

  /**
   * Agrega un participante a un chat grupal
   */
  async addParticipant(chatId: string, userId: string): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Debes estar autenticado');
      }

      // Descomentar cuando instales Firebase
      /*
      const chatRef = ref(this.database, `chats/${chatId}`);
      const snapshot = await get(chatRef);

      if (snapshot.exists()) {
        const chat = snapshot.val();
        
        if (!chat.isGroup) {
          throw new Error('Solo puedes agregar participantes a chats grupales');
        }

        if (!chat.participants.includes(currentUser.uid) && !this.authService.isAdmin()) {
          throw new Error('No tienes permisos para agregar participantes');
        }

        if (chat.participants.includes(userId)) {
          throw new Error('El usuario ya es participante de este chat');
        }

        const userData = await this.authService.getUserData(userId);
        const participantInfo: ParticipantInfo = {
          uid: userData.uid,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          role: userData.role,
          joinedAt: Date.now()
        };

        await update(chatRef, {
          participants: [...chat.participants, userId],
          [`participantsInfo/${userId}`]: participantInfo,
          [`unreadCount/${userId}`]: 0
        });
      }
      */

      // Implementación temporal sin Firebase
      throw new Error('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      throw new Error(`Error al agregar participante: ${error.message}`);
    }
  }

  /**
   * Elimina un participante de un chat grupal
   */
  async removeParticipant(chatId: string, userId: string): Promise<void> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Debes estar autenticado');
      }

      // Descomentar cuando instales Firebase
      /*
      const chatRef = ref(this.database, `chats/${chatId}`);
      const snapshot = await get(chatRef);

      if (snapshot.exists()) {
        const chat = snapshot.val();
        
        if (!chat.isGroup) {
          throw new Error('Solo puedes eliminar participantes de chats grupales');
        }

        if (chat.createdBy !== currentUser.uid && !this.authService.isAdmin() && userId !== currentUser.uid) {
          throw new Error('No tienes permisos para eliminar participantes');
        }

        if (!chat.participants.includes(userId)) {
          throw new Error('El usuario no es participante de este chat');
        }

        const updatedParticipants = chat.participants.filter((uid: string) => uid !== userId);
        const participantsInfo = { ...chat.participantsInfo };
        delete participantsInfo[userId];

        const unreadCount = { ...chat.unreadCount };
        delete unreadCount[userId];

        await update(chatRef, {
          participants: updatedParticipants,
          participantsInfo,
          unreadCount
        });
      }
      */

      // Implementación temporal sin Firebase
      throw new Error('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      throw new Error(`Error al eliminar participante: ${error.message}`);
    }
  }

  /**
   * Busca chats por nombre de grupo o participante
   */
  async searchChats(searchTerm: string, userId: string): Promise<Chat[]> {
    try {
      // Descomentar cuando instales Firebase
      /*
      const chatsRef = ref(this.database, 'chats');
      const snapshot = await get(chatsRef);

      if (snapshot.exists()) {
        const chatsData = snapshot.val();
        const results: Chat[] = [];
        
        Object.keys(chatsData).forEach(chatId => {
          const chat = chatsData[chatId];
          
          if (chat.participants.includes(userId)) {
            const searchLower = searchTerm.toLowerCase();
            
            // Buscar en nombre de grupo
            if (chat.isGroup && chat.groupName?.toLowerCase().includes(searchLower)) {
              results.push({ ...chat, id: chatId });
              return;
            }

            // Buscar en nombres de participantes
            const participantNames = Object.values(chat.participantsInfo || {})
              .map((p: any) => p.displayName.toLowerCase());
            
            if (participantNames.some((name: string) => name.includes(searchLower))) {
              results.push({ ...chat, id: chatId });
            }
          }
        });

        return results;
      }

      return [];
      */

      // Implementación temporal sin Firebase
      throw new Error('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      throw new Error(`Error al buscar chats: ${error.message}`);
    }
  }
}
