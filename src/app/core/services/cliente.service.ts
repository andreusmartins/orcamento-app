import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { supabase } from '../supabase/supabase.client';
import { Cliente } from '../models/cliente.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ClienteService {

  constructor(private auth: AuthService) {}

  listar() {
    return from(
      supabase.from('clientes').select('*').order('nome').then(({ data, error }) => {
        if (error) throw error;
        return (data || []) as Cliente[];
      })
    );
  }

  list() { return this.listar(); }

  buscarPorId(id: number) {
    return from(
      supabase.from('clientes').select('*').eq('id', id).single().then(({ data, error }) => {
        if (error) throw error;
        return data as Cliente;
      })
    );
  }

  criar(cliente: Cliente) {
    const empresaId = this.auth.getUsuario()?.empresaId;
    return from(
      supabase.from('clientes').insert({
        nome: cliente.nome,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        email: cliente.email || null,
        empresa_id: empresaId ?? null
      }).select().single().then(({ data, error }) => {
        if (error) throw error;
        return data as Cliente;
      })
    );
  }

  atualizar(id: number, cliente: Cliente) {
    return from(
      supabase.from('clientes').update({
        nome: cliente.nome,
        telefone: cliente.telefone,
        endereco: cliente.endereco,
        email: cliente.email || null
      }).eq('id', id).select().single().then(({ data, error }) => {
        if (error) throw error;
        return data as Cliente;
      })
    );
  }

  deletar(id: number) {
    return from(
      supabase.from('clientes').delete().eq('id', id).then(({ error }) => {
        if (error) throw error;
      })
    );
  }
}
