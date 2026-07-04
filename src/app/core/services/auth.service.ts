import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { from, Observable } from 'rxjs';
import { supabase } from '../supabase/supabase.client';

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

  constructor(private router: Router) {}

  login(email: string, senha: string): Observable<UsuarioLogado> {
    return from(this.doLogin(email, senha));
  }

  private async doLogin(email: string, senha: string): Promise<UsuarioLogado> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw new Error(error.message);

    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('nome, role, empresa_id, ativo')
      .eq('id', data.user!.id)
      .single();
    if (pErr) throw new Error(pErr.message);
    if (!profile?.ativo) throw new Error('Usuário bloqueado. Fale com o administrador.');

    const usuario: UsuarioLogado = {
      nome: profile.nome || email,
      email: data.user!.email!,
      role: profile.role as UsuarioLogado['role'],
      token: data.session!.access_token,
      empresaId: profile.empresa_id ?? undefined
    };
    localStorage.setItem(this.KEY, JSON.stringify(usuario));
    return usuario;
  }

  logout() {
    supabase.auth.signOut();
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

  isLogado(): boolean { return !!this.getToken(); }
  isAdmin(): boolean { return this.getUsuario()?.role === 'ADMIN'; }
  isSuperAdmin(): boolean { return this.getUsuario()?.role === 'SUPER_ADMIN'; }
}
