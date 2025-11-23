import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { MessageType } from '../Models';
import { STORAGE_TOKEN } from '../app/firebase.providers';

// Nota: Debes instalar Firebase con: npm install firebase
// import { FirebaseStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTaskSnapshot } from 'firebase/storage';

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // Descomentar cuando instales Firebase
  // private storage = inject(STORAGE_TOKEN);

  // Tamaños máximos permitidos (en bytes)
  private readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
  private readonly MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10 MB
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
  private readonly MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

  constructor() {}

  /**
   * Sube un archivo a Firebase Storage
   */
  async uploadFile(
    file: File,
    chatId: string,
    messageType: MessageType
  ): Promise<{ downloadURL: string; fileName: string; fileSize: number }> {
    try {
      // Validar tamaño del archivo
      this.validateFileSize(file, messageType);

      // Descomentar cuando instales Firebase
      /*
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `chats/${chatId}/${messageType}s/${fileName}`;
      
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            reject(new Error(`Error al subir archivo: ${error.message}`));
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              downloadURL,
              fileName: file.name,
              fileSize: file.size
            });
          }
        );
      });
      */

      // Implementación temporal sin Firebase
      throw new Error('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      throw new Error(`Error al subir archivo: ${error.message}`);
    }
  }

  /**
   * Sube un archivo con seguimiento de progreso
   */
  uploadFileWithProgress(
    file: File,
    chatId: string,
    messageType: MessageType
  ): Observable<UploadProgress> {
    return new Observable(observer => {
      try {
        // Validar tamaño del archivo
        this.validateFileSize(file, messageType);

        // Descomentar cuando instales Firebase
        /*
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const filePath = `chats/${chatId}/${messageType}s/${fileName}`;
        
        const storageRef = ref(this.storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            observer.next({ progress });
          },
          (error) => {
            observer.error({ progress: 0, error: error.message });
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              observer.next({ progress: 100, downloadURL });
              observer.complete();
            } catch (error: any) {
              observer.error({ progress: 100, error: error.message });
            }
          }
        );
        */

        // Implementación temporal sin Firebase
        observer.error({ progress: 0, error: 'Firebase no está configurado. Instala Firebase primero.' });
      } catch (error: any) {
        observer.error({ progress: 0, error: error.message });
      }
    });
  }

  /**
   * Sube una imagen
   */
  async uploadImage(file: File, chatId: string): Promise<{ downloadURL: string; fileName: string; fileSize: number }> {
    if (!this.isValidImageType(file)) {
      throw new Error('Tipo de imagen no válido. Solo se permiten: JPG, PNG, GIF, WebP');
    }

    return this.uploadFile(file, chatId, MessageType.IMAGE);
  }

  /**
   * Sube un audio
   */
  async uploadAudio(file: File, chatId: string): Promise<{ downloadURL: string; fileName: string; fileSize: number }> {
    if (!this.isValidAudioType(file)) {
      throw new Error('Tipo de audio no válido. Solo se permiten: MP3, WAV, OGG, M4A');
    }

    return this.uploadFile(file, chatId, MessageType.AUDIO);
  }

  /**
   * Sube un video
   */
  async uploadVideo(file: File, chatId: string): Promise<{ downloadURL: string; fileName: string; fileSize: number }> {
    if (!this.isValidVideoType(file)) {
      throw new Error('Tipo de video no válido. Solo se permiten: MP4, WebM, OGG');
    }

    return this.uploadFile(file, chatId, MessageType.VIDEO);
  }

  /**
   * Sube un archivo genérico
   */
  async uploadGenericFile(file: File, chatId: string): Promise<{ downloadURL: string; fileName: string; fileSize: number }> {
    return this.uploadFile(file, chatId, MessageType.FILE);
  }

  /**
   * Elimina un archivo de Firebase Storage
   */
  async deleteFile(fileURL: string): Promise<void> {
    try {
      // Descomentar cuando instales Firebase
      /*
      const fileRef = ref(this.storage, fileURL);
      await deleteObject(fileRef);
      */

      // Implementación temporal sin Firebase
      throw new Error('Firebase no está configurado. Instala Firebase primero.');
    } catch (error: any) {
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }
  }

  /**
   * Convierte un archivo a Base64 (para previsualización)
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Redimensiona una imagen antes de subirla
   */
  async resizeImage(file: File, maxWidth: number = 1920, maxHeight: number = 1080): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular nuevas dimensiones manteniendo aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(resizedFile);
            } else {
              reject(new Error('Error al redimensionar imagen'));
            }
          }, file.type);
        };
        img.src = e.target.result;
      };

      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Comprime un audio reduciendo su bitrate
   */
  async compressAudio(file: File): Promise<File> {
    // Esta es una implementación básica. Para una compresión real,
    // necesitarías usar una librería como ffmpeg.wasm
    console.warn('La compresión de audio requiere una librería adicional como ffmpeg.wasm');
    return file;
  }

  /**
   * Valida el tamaño del archivo según su tipo
   */
  private validateFileSize(file: File, messageType: MessageType): void {
    let maxSize: number;

    switch (messageType) {
      case MessageType.IMAGE:
        maxSize = this.MAX_IMAGE_SIZE;
        break;
      case MessageType.AUDIO:
        maxSize = this.MAX_AUDIO_SIZE;
        break;
      case MessageType.VIDEO:
        maxSize = this.MAX_VIDEO_SIZE;
        break;
      case MessageType.FILE:
        maxSize = this.MAX_FILE_SIZE;
        break;
      default:
        maxSize = this.MAX_FILE_SIZE;
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      throw new Error(`El archivo excede el tamaño máximo permitido de ${maxSizeMB} MB`);
    }
  }

  /**
   * Valida si el archivo es una imagen válida
   */
  private isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * Valida si el archivo es un audio válido
   */
  private isValidAudioType(file: File): boolean {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/m4a'];
    return validTypes.includes(file.type);
  }

  /**
   * Valida si el archivo es un video válido
   */
  private isValidVideoType(file: File): boolean {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    return validTypes.includes(file.type);
  }

  /**
   * Obtiene el tipo de mensaje según el tipo de archivo
   */
  getMessageTypeFromFile(file: File): MessageType {
    if (this.isValidImageType(file)) {
      return MessageType.IMAGE;
    } else if (this.isValidAudioType(file)) {
      return MessageType.AUDIO;
    } else if (this.isValidVideoType(file)) {
      return MessageType.VIDEO;
    } else {
      return MessageType.FILE;
    }
  }

  /**
   * Formatea el tamaño del archivo a formato legible
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Genera una miniatura de video
   */
  async generateVideoThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        video.currentTime = 1; // Capturar en el segundo 1
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const thumbnail = canvas.toDataURL('image/jpeg');
        resolve(thumbnail);
      };

      video.onerror = () => reject(new Error('Error al generar miniatura'));

      const url = URL.createObjectURL(file);
      video.src = url;
    });
  }
}
