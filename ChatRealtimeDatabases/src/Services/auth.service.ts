import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User, UserRole } from '../Models';
import { AUTH_TOKEN, DATABASE_TOKEN } from '../app/firebase.providers';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { Database, ref, set, get, update } from 'firebase/database';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private auth: Auth = inject(AUTH_TOKEN);
  private database: Database = inject(DATABASE_TOKEN);
  private googleProvider = new GoogleAuthProvider();

  constructor() {
    this.googleProvider.setCustomParameters({ prompt: 'select_account' });
    this.initializeAuthListener();
  }

  /**
   * Inicializa el listener de cambios de autenticación
   */
  private initializeAuthListener(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.ensureUserDocument(firebaseUser);
        this.currentUserSubject.next(user);
        await this.updateLastSeen(firebaseUser.uid);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  /**
   * Registra un nuevo usuario
   */
  async register(
    email: string,
    password: string,
    displayName: string,
    role: UserRole = UserRole.USUARIO
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(userCredential.user, { displayName });

      const newUser: User = {
        uid: userCredential.user.uid,
        email,
        displayName,
        photoURL: userCredential.user.photoURL || undefined,
        role,
        isActive: true,
        createdAt: Date.now(),
        lastSeen: Date.now()
      };

      await set(this.getUserRef(newUser.uid), newUser);
      this.currentUserSubject.next(newUser);
      return newUser;
    } catch (error: any) {
      throw new Error(`Error al registrar usuario: ${error.message}`);
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async login(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = await this.ensureUserDocument(userCredential.user);
      
      await this.updateLastSeen(userCredential.user.uid);
      this.currentUserSubject.next(user);
      return user;
    } catch (error: any) {
      throw new Error(`Error al iniciar sesión: ${error.message}`);
    }
  }

  /**
   * Inicia sesión/registro con Google
   */
  async loginWithGoogle(defaultRole: UserRole = UserRole.USUARIO): Promise<User> {
    try {
      const credential = await signInWithPopup(this.auth, this.googleProvider);
      const user = await this.ensureUserDocument(credential.user, defaultRole);
      await this.updateLastSeen(credential.user.uid);
      this.currentUserSubject.next(user);
      return user;
    } catch (error: any) {
      throw new Error(`Error al autenticarse con Google: ${error.message}`);
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  async logout(): Promise<void> {
    try {
      const currentUser = this.currentUserSubject.value;
      if (currentUser) {
        await this.updateUserStatus(currentUser.uid, false);
      }
      await signOut(this.auth);
      this.currentUserSubject.next(null);
    } catch (error: any) {
      throw new Error(`Error al cerrar sesión: ${error.message}`);
    }
  }

  /**
   * Obtiene los datos del usuario desde Firebase
   */
  async getUserData(uid: string): Promise<User> {
    try {
      const snapshot = await get(this.getUserRef(uid));
      if (snapshot.exists()) {
        return snapshot.val() as User;
      }

      const firebaseUser = this.auth.currentUser;
      if (firebaseUser && firebaseUser.uid === uid) {
        return this.ensureUserDocument(firebaseUser);
      }

      throw new Error('Usuario no encontrado');
    } catch (error: any) {
      throw new Error(`Error al obtener datos del usuario: ${error.message}`);
    }
  }

  /**
   * Actualiza el último acceso del usuario
   */
  async updateLastSeen(uid: string): Promise<void> {
    try {
      await update(this.getUserRef(uid), {
        lastSeen: Date.now(),
        isActive: true
      });
    } catch (error: any) {
      console.error('Error al actualizar último acceso:', error);
    }
  }

  /**
   * Actualiza el estado del usuario (activo/inactivo)
   */
  async updateUserStatus(uid: string, isActive: boolean): Promise<void> {
    try {
      await update(this.getUserRef(uid), { isActive });
    } catch (error: any) {
      console.error('Error al actualizar estado del usuario:', error);
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(uid: string, updates: Partial<User>): Promise<void> {
    try {
      await update(this.getUserRef(uid), updates);
      const updatedUser = await this.getUserData(uid);
      this.currentUserSubject.next(updatedUser);
    } catch (error: any) {
      throw new Error(`Error al actualizar perfil: ${error.message}`);
    }
  }

  /**
   * Actualiza el rol del usuario (solo administradores)
   */
  async updateUserRole(targetUid: string, newRole: UserRole): Promise<void> {
    const currentUser = this.currentUserSubject.value;
    
    if (!currentUser || currentUser.role !== UserRole.ADMINISTRADOR) {
      throw new Error('No tienes permisos para cambiar roles de usuario');
    }

    try {
      await update(this.getUserRef(targetUid), { role: newRole });
      if (this.currentUserSubject.value?.uid === targetUid) {
        const updatedUser = await this.getUserData(targetUid);
        this.currentUserSubject.next(updatedUser);
      }
    } catch (error: any) {
      throw new Error(`Error al actualizar rol: ${error.message}`);
    }
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role || false;
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMINISTRADOR);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  private getUserRef(uid: string) {
    return ref(this.database, `users/${uid}`);
  }

  private async ensureUserDocument(
    firebaseUser: FirebaseUser,
    defaultRole: UserRole = UserRole.USUARIO
  ): Promise<User> {
    const userRef = this.getUserRef(firebaseUser.uid);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const existingUser = snapshot.val() as User;
      return existingUser;
    }

    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email || 'Usuario',
      photoURL: firebaseUser.photoURL || undefined,
      role: defaultRole,
      isActive: true,
      createdAt: Date.now(),
      lastSeen: Date.now()
    };

    await set(userRef, newUser);
    return newUser;
  }
}
