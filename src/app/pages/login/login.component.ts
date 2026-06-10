import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = '';
  carregando = false;
  mostrarDicaSenha = false;

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLogado()) {
      const role = auth.getUsuario()?.role;
      if (role === 'SUPER_ADMIN') router.navigate(['/super-admin']);
      else if (role === 'ADMIN') router.navigate(['/admin']);
      else router.navigate(['/novo-orcamento']);
    }
  }

  entrar() {
    if (!this.email || !this.senha) {
      this.erro = 'Preencha email e senha';
      return;
    }
    this.carregando = true;
    this.erro = '';
    this.auth.login(this.email, this.senha).subscribe({
      next: (u) => {
        if (u.role === 'SUPER_ADMIN') {
          this.router.navigate(['/super-admin']);
        } else if (u.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/novo-orcamento']);
        }
      },
      error: () => {
        this.erro = 'Email ou senha incorretos';
        this.carregando = false;
      }
    });
  }
}
