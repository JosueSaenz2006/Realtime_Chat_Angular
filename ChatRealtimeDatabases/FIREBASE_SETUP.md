# Configuración de Firebase para el Chat en Tiempo Real

## Instalación de Firebase

Ejecuta el siguiente comando en la terminal:

```powershell
npm install firebase
```

## Configuración del Proyecto Firebase

### 1. Crear proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Firebase Realtime Database**
4. Habilita **Firebase Storage**
5. Habilita **Firebase Authentication** (Email/Password)

### 2. Obtener credenciales de Firebase

1. En Firebase Console, ve a Configuración del proyecto (⚙️)
2. En la sección "Tus aplicaciones", selecciona la aplicación web (</> icono)
3. Copia las credenciales de configuración

### 3. Crear archivo de configuración

Crea el archivo `src/environments/firebase.config.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  databaseURL: "TU_DATABASE_URL",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### 4. Inicializar Firebase en la aplicación

Crea el archivo `src/app/firebase.providers.ts`:

```typescript
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { firebaseConfig } from '../environments/firebase.config';

export const firebaseProviders = [
  provideFirebaseApp(() => initializeApp(firebaseConfig)),
  provideAuth(() => getAuth()),
  provideDatabase(() => getDatabase()),
  provideStorage(() => getStorage())
];
```

O si prefieres usar el SDK modular de Firebase sin AngularFire:

```typescript
import { Provider } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, Storage } from 'firebase/storage';
import { firebaseConfig } from '../environments/firebase.config';

const app = initializeApp(firebaseConfig);

export const firebaseProviders: Provider[] = [
  { provide: Auth, useValue: getAuth(app) },
  { provide: Database, useValue: getDatabase(app) },
  { provide: Storage, useValue: getStorage(app) }
];
```

### 5. Registrar providers en app.config.ts

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { firebaseProviders } from './firebase.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    ...firebaseProviders
  ]
};
```

### 6. Configurar reglas de seguridad en Firebase Realtime Database

Ve a Firebase Console > Realtime Database > Reglas y configura:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'administrador'"
      }
    },
    "chats": {
      "$chatId": {
        ".read": "auth != null && data.child('participants').child(auth.uid).exists()",
        ".write": "auth != null && (data.child('participants').child(auth.uid).exists() || !data.exists())"
      }
    },
    "messages": {
      "$chatId": {
        ".read": "auth != null && root.child('chats').child($chatId).child('participants').child(auth.uid).exists()",
        "$messageId": {
          ".write": "auth != null && (newData.child('senderId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'administrador')",
          ".validate": "newData.hasChildren(['senderId', 'content', 'timestamp', 'type'])"
        }
      }
    }
  }
}
```

### 7. Configurar reglas de seguridad en Firebase Storage

Ve a Firebase Console > Storage > Reglas y configura:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chats/{chatId}/{messageType}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.resource.size < 50 * 1024 * 1024 // Máximo 50MB
                   && (
                     messageType == 'images' && request.resource.contentType.matches('image/.*') ||
                     messageType == 'audios' && request.resource.contentType.matches('audio/.*') ||
                     messageType == 'videos' && request.resource.contentType.matches('video/.*') ||
                     messageType == 'files'
                   );
      allow delete: if request.auth != null;
    }
  }
}
```

## Estructura de Datos en Firebase Realtime Database

### Users
```
users/
  {uid}/
    uid: string
    email: string
    displayName: string
    photoURL: string (opcional)
    role: "usuario" | "programador" | "administrador"
    isActive: boolean
    createdAt: timestamp
    lastSeen: timestamp (opcional)
```

### Chats
```
chats/
  {chatId}/
    id: string
    participants: [uid1, uid2, ...]
    participantsInfo/
      {uid}/
        uid: string
        displayName: string
        photoURL: string (opcional)
        role: string
        joinedAt: timestamp
    createdBy: string
    createdAt: timestamp
    isGroup: boolean
    groupName: string (opcional)
    groupPhotoURL: string (opcional)
    lastMessage/
      senderId: string
      senderName: string
      content: string
      type: string
      timestamp: timestamp
    lastMessageAt: timestamp
    unreadCount/
      {uid}: number
```

### Messages
```
messages/
  {chatId}/
    {messageId}/
      id: string
      chatId: string
      senderId: string
      senderName: string
      senderPhotoURL: string (opcional)
      type: "text" | "image" | "audio" | "video" | "file"
      content: string
      mediaURL: string (opcional)
      mediaName: string (opcional)
      mediaSize: number (opcional)
      timestamp: timestamp
      isRead: boolean
      readAt: timestamp (opcional)
      isEdited: boolean (opcional)
      editedAt: timestamp (opcional)
```

## Uso de los Servicios

### AuthService

```typescript
import { Component, inject } from '@angular/core';
import { AuthService } from './Services/auth.service';
import { UserRole } from './Models';

export class MyComponent {
  private authService = inject(AuthService);

  async register() {
    try {
      const user = await this.authService.register(
        'email@example.com',
        'password123',
        'Nombre Usuario',
        UserRole.USUARIO
      );
      console.log('Usuario registrado:', user);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async login() {
    try {
      const user = await this.authService.login('email@example.com', 'password123');
      console.log('Sesión iniciada:', user);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
```

### ChatService

```typescript
import { Component, inject } from '@angular/core';
import { ChatService } from './Services/chat.service';
import { MessageType } from './Models';

export class ChatComponent {
  private chatService = inject(ChatService);

  async createChat(participantIds: string[]) {
    try {
      const chat = await this.chatService.createChat({
        participants: participantIds,
        createdBy: 'current-user-id',
        isGroup: false
      });
      console.log('Chat creado:', chat);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async sendMessage(chatId: string, content: string) {
    await this.chatService.sendTextMessage(chatId, content);
  }

  loadMessages(chatId: string) {
    this.chatService.getChatMessages(chatId);
    
    // Suscribirse a los mensajes
    this.chatService.messages$.subscribe(messagesMap => {
      const messages = messagesMap[chatId] || [];
      console.log('Mensajes:', messages);
    });
  }
}
```

### StorageService

```typescript
import { Component, inject } from '@angular/core';
import { StorageService } from './Services/storage.service';
import { ChatService } from './Services/chat.service';
import { MessageType } from './Models';

export class UploadComponent {
  private storageService = inject(StorageService);
  private chatService = inject(ChatService);

  async uploadAndSendImage(file: File, chatId: string) {
    try {
      // Subir imagen
      const { downloadURL, fileName, fileSize } = await this.storageService.uploadImage(file, chatId);
      
      // Enviar mensaje con la imagen
      await this.chatService.sendMessage({
        chatId,
        senderId: 'current-user-id',
        type: MessageType.IMAGE,
        content: fileName,
        mediaURL: downloadURL,
        mediaName: fileName,
        mediaSize: fileSize
      });
      
      console.log('Imagen enviada');
    } catch (error) {
      console.error('Error:', error);
    }
  }

  uploadWithProgress(file: File, chatId: string) {
    const messageType = this.storageService.getMessageTypeFromFile(file);
    
    this.storageService.uploadFileWithProgress(file, chatId, messageType)
      .subscribe({
        next: (progress) => {
          console.log(`Progreso: ${progress.progress}%`);
          if (progress.downloadURL) {
            console.log('URL:', progress.downloadURL);
          }
        },
        error: (error) => console.error('Error:', error),
        complete: () => console.log('Subida completada')
      });
  }
}
```

## Descomentando el código

Una vez que hayas instalado Firebase y configurado todo:

1. Instala Firebase: `npm install firebase`
2. Configura las credenciales como se indica arriba
3. En cada servicio (`auth.service.ts`, `chat.service.ts`, `storage.service.ts`):
   - Descomenta los imports de Firebase
   - Descomenta las inyecciones de dependencias
   - Descomenta el código dentro de cada método
   - Elimina los `throw new Error` temporales

## Roles de Usuario

- **USUARIO**: Puede enviar y recibir mensajes, crear chats
- **PROGRAMADOR**: Mismos permisos que usuario (puedes extender según necesites)
- **ADMINISTRADOR**: Puede gestionar roles, eliminar mensajes de otros usuarios, administrar chats

## Notas Importantes

1. Los servicios están preparados para funcionar con Firebase, pero requieren la instalación e inicialización de Firebase
2. Todos los métodos tienen validaciones de permisos según roles
3. Los mensajes se sincronizan en tiempo real usando `onValue` de Firebase
4. Los archivos multimedia se suben a Firebase Storage con límites de tamaño
5. Los contadores de mensajes no leídos se actualizan automáticamente
