import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  async onLogin() {
    if (!this.email() || !this.password()) {
      this.error.set('Por favor completa todos los campos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.authService.login(this.email(), this.password());
      this.router.navigate(['/chat']);
    } catch (error: any) {
      this.error.set(error.message || 'Error al iniciar sesión');
    } finally {
      this.loading.set(false);
    }
  }

  async onLoginWithGoogle() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/chat']);
    } catch (error: any) {
      this.error.set(error.message || 'No se pudo iniciar sesión con Google');
    } finally {
      this.loading.set(false);
    }
  }
}
