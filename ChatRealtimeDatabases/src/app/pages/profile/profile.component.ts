import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { User } from '../../../Models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  displayName = signal('');
  editMode = signal(false);
  loading = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser.set(user);
        this.displayName.set(user.displayName);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  toggleEditMode() {
    this.editMode.set(!this.editMode());
    if (!this.editMode()) {
      // Restaurar valores originales si se cancela
      const user = this.currentUser();
      if (user) {
        this.displayName.set(user.displayName);
      }
    }
  }

  async saveProfile() {
    const user = this.currentUser();
    if (!user) return;

    if (!this.displayName().trim()) {
      this.showMessage('El nombre no puede estar vacío', 'error');
      return;
    }

    this.loading.set(true);
    this.message.set('');

    try {
      await this.authService.updateProfile(user.uid, {
        displayName: this.displayName()
      });

      this.showMessage('Perfil actualizado correctamente', 'success');
      this.editMode.set(false);
    } catch (error: any) {
      this.showMessage(error.message || 'Error al actualizar perfil', 'error');
    } finally {
      this.loading.set(false);
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.message.set(''), 5000);
  }

  getRoleBadgeClass(role: string): string {
    const classes: { [key: string]: string } = {
      'administrador': 'role-admin',
      'programador': 'role-programmer',
      'usuario': 'role-user'
    };
    return classes[role] || 'role-user';
  }
}
