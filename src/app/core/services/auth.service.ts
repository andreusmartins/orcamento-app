import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UsuarioLogado {
  nome: string;
  email: string;
  role: 'ADMIN' | 'CLIENTE' | 'SUPER_ADMIN';
  token: string;
  empresaId?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'usuario_logado';
  private api = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, senha: string) {
    return this.http.post<UsuarioLogado>(`${this.api}/auth/login`, { email, senha }).pipe(
      tap(res => localStorage.setItem(this.KEY, JSON.stringify(res)))
    );
  }

  logout() {
    localStorage.removeItem(this.KEY);
    this.router.navigate(['/login']);
  }

  getUsuario(): UsuarioLogado | null {
    const s = localStorage.getItem(this.KEY);
    return s ? JSON.parse(s) : null;
  }

  getToken(): string | null {
    return this.getUsuario()?.token ?? null;
  }

  isLogado(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getUsuario()?.role === 'ADMIN';
  }

  isSuperAdmin(): boolean {
    return this.getUsuario()?.role === 'SUPER_ADMIN';
  }
}
