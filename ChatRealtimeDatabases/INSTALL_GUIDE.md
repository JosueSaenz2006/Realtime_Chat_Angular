# 💬 Chat en Tiempo Real - Angular + Firebase

Chat completo en tiempo real desarrollado con Angular 21 y Firebase Realtime Database.

## ✨ Características

- 🔐 **Autenticación completa** (Login/Registro)
- 👥 **Sistema de roles** (Usuario, Programador, Administrador)
- 💬 **Chat en tiempo real**
- 📷 **Mensajes multimedia** (imágenes, audios, videos, archivos)
- ✅ **Indicadores de lectura**
- 👤 **Perfiles de usuario editables**
- 🎨 **Interfaz moderna y responsive**
- 📱 **Compatible con móviles**

## 🚀 Instalación

### 1. Instalar dependencias

```powershell
npm install
```

### 2. Instalar Firebase

```powershell
npm install firebase
```

### 3. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita:
   - **Authentication** (Email/Password)
   - **Realtime Database**
   - **Storage**
4. Obtén las credenciales de configuración
5. Edita el archivo `src/environments/firebase.config.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 4. Configurar reglas de Firebase

#### Realtime Database Rules
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
          ".write": "auth != null && (newData.child('senderId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'administrador')"
        }
      }
    }
  }
}
```

#### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chats/{chatId}/{messageType}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
                   && request.resource.size < 50 * 1024 * 1024;
      allow delete: if request.auth != null;
    }
  }
}
```

### 5. Descomentar código en los servicios

Una vez configurado Firebase, descomenta el código en:
- `src/Services/auth.service.ts`
- `src/Services/chat.service.ts`
- `src/Services/storage.service.ts`

## 🎯 Uso

### Ejecutar en desarrollo

```powershell
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### Construir para producción

```powershell
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── login/           # Componente de inicio de sesión
│   │   ├── register/        # Componente de registro
│   │   ├── chat-list/       # Lista de conversaciones
│   │   ├── chat-room/       # Sala de chat
│   │   └── message-input/   # Input de mensajes
│   ├── pages/
│   │   ├── home/            # Página principal
│   │   ├── chat-page/       # Página de chat
│   │   └── profile/         # Página de perfil
│   ├── firebase.providers.ts
│   ├── app.routes.ts
│   └── app.config.ts
├── Models/
│   ├── user.model.ts        # Modelo de usuario
│   ├── message.model.ts     # Modelo de mensaje
│   ├── chat.model.ts        # Modelo de chat
│   └── index.ts
├── Services/
│   ├── auth.service.ts      # Servicio de autenticación
│   ├── chat.service.ts      # Servicio de chat
│   ├── storage.service.ts   # Servicio de almacenamiento
│   └── index.ts
└── environments/
    └── firebase.config.ts   # Configuración de Firebase
```

## 👥 Roles de Usuario

### Usuario
- Enviar y recibir mensajes
- Crear chats
- Editar su propio perfil

### Programador
- Mismos permisos que Usuario
- (Puedes extender funcionalidades según necesites)

### Administrador
- Todos los permisos de Usuario
- Cambiar roles de otros usuarios
- Eliminar mensajes de cualquier usuario
- Administrar chats

## 🎨 Componentes Principales

### Autenticación
- **LoginComponent**: Inicio de sesión con email/password
- **RegisterComponent**: Registro de nuevos usuarios con selección de rol

### Chat
- **ChatListComponent**: Lista de conversaciones activas
- **ChatRoomComponent**: Sala de chat con mensajes en tiempo real
- **MessageInputComponent**: Input para enviar mensajes y archivos

### Páginas
- **HomeComponent**: Página de inicio con información del usuario
- **ChatPageComponent**: Contenedor principal del chat
- **ProfileComponent**: Perfil editable del usuario

## 🔧 Servicios

### AuthService
- Registro e inicio de sesión
- Gestión de roles y permisos
- Actualización de perfiles
- Control de sesiones

### ChatService
- Crear y gestionar chats
- Enviar mensajes en tiempo real
- Marcar mensajes como leídos
- Editar y eliminar mensajes
- Gestión de participantes

### StorageService
- Subir archivos multimedia
- Validación de tipos y tamaños
- Redimensionamiento de imágenes
- Seguimiento de progreso de carga

## 📱 Responsive Design

La aplicación está completamente optimizada para:
- 💻 Desktop
- 📱 Tablets
- 📱 Móviles

## 🛠️ Tecnologías Utilizadas

- **Angular 21** - Framework frontend
- **Firebase Realtime Database** - Base de datos en tiempo real
- **Firebase Authentication** - Autenticación de usuarios
- **Firebase Storage** - Almacenamiento de archivos
- **TypeScript** - Lenguaje de programación
- **CSS3** - Estilos y animaciones

## 📄 Documentación Adicional

Para más detalles sobre la configuración de Firebase, consulta `FIREBASE_SETUP.md`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Josue Saenz - 2024

---

**¡Disfruta tu chat en tiempo real! 💬✨**
