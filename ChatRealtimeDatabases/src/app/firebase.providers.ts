import { Provider, InjectionToken } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from '../environments/firebase.config';

// Tokens de inyección
export const AUTH_TOKEN = new InjectionToken<Auth>('Firebase Auth');
export const DATABASE_TOKEN = new InjectionToken<Database>('Firebase Database');
export const STORAGE_TOKEN = new InjectionToken<FirebaseStorage>('Firebase Storage');

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los providers para usar en app.config.ts
export const firebaseProviders: Provider[] = [
  { provide: AUTH_TOKEN, useValue: getAuth(app) },
  { provide: DATABASE_TOKEN, useValue: getDatabase(app) },
  { provide: STORAGE_TOKEN, useValue: getStorage(app) }
];
