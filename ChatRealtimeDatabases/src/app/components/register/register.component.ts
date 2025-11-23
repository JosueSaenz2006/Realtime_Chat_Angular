import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { UserRole } from '../../../Models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  displayName = signal('');
  role = signal<UserRole>(UserRole.USUARIO);
  loading = signal(false);
  error = signal('');

  userRoles = [
    { value: UserRole.USUARIO, label: 'Usuario' },
    { value: UserRole.PROGRAMADOR, label: 'Programador' },
    { value: UserRole.ADMINISTRADOR, label: 'Administrador' }
  ];

  async onRegister() {
    // Validaciones
    if (!this.email() || !this.password() || !this.displayName()) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    if (this.password().length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.register(
        this.email(),
        this.password(),
        this.displayName(),
        this.role()
      );
      this.router.navigate(['/chat']);
    } catch (error: any) {
      this.error.set(error.message || 'Error al registrarse');
    } finally {
      this.loading.set(false);
    }
  }

  async onRegisterWithGoogle() {
    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.loginWithGoogle(this.role());
      this.router.navigate(['/chat']);
    } catch (error: any) {
      this.error.set(error.message || 'No se pudo continuar con Google');
    } finally {
      this.loading.set(false);
    }
  }
}
