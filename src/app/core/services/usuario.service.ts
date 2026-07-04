import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { supabase } from '../supabase/supabase.client';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'CLIENTE' | 'SUPER_ADMIN';
  ativo: boolean;
  empresa?: { id: number; nome: string };
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {

  listar() {
    return from(
      supabase.from('profiles')
        .select('*, empresa:empresas(id, nome)')
        .order('nome')
        .then(({ data, error }) => {
          if (error) throw error;
          return (data || []).map((p: any): Usuario => ({
            id: p.id,
            nome: p.nome,
            email: p.email || '',
            role: p.role,
            ativo: p.ativo,
            empresa: p.empresa
          }));
        })
    );
  }

  criar(dados: { nome: string; email: string; senha: string; empresaId?: string; role?: string }) {
    return from(this.doCriar(dados));
  }

  private async doCriar(dados: { nome: string; email: string; senha: string; empresaId?: string; role?: string }): Promise<Usuario> {
    const { data: { session: sessaoAtual } } = await supabase.auth.getSession();

    const { data, error } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: {
        data: {
          nome: dados.nome,
          role: dados.role || 'CLIENTE',
          empresa_id: dados.empresaId ? Number(dados.empresaId) : null
        }
      }
    });
    if (error) throw error;

    if (sessaoAtual) {
      await supabase.auth.setSession({
        access_token: sessaoAtual.access_token,
        refresh_token: sessaoAtual.refresh_token
      });
    }

    return {
      id: data.user!.id,
      nome: dados.nome,
      email: dados.email,
      role: (dados.role || 'CLIENTE') as Usuario['role'],
      ativo: true,
      empresa: dados.empresaId ? { id: Number(dados.empresaId), nome: '' } : undefined
    };
  }

  alterarAtivo(id: string, ativo: boolean) {
    return from(
      supabase.from('profiles').update({ ativo }).eq('id', id)
        .select().single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as unknown as Usuario;
        })
    );
  }

  alterarSenha(_id: string, _senha: string) {
    return from(Promise.reject(new Error(
      'Troca de senha de outros usuários requer a Edge Function admin-usuario. Ver supabase/functions/admin-usuario/index.ts'
    )));
  }

  excluir(id: string) {
    return from(
      supabase.from('profiles').delete().eq('id', id)
        .then(({ error }) => { if (error) throw error; })
    );
  }
}
