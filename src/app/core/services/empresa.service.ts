import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { supabase } from '../supabase/supabase.client';

export interface Empresa {
  id?: number;
  nome: string;
  telefone?: string;
  valorMensalidade?: number;
  dataVencimento?: string;
  ativo: boolean;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class EmpresaService {

  listar() {
    return from(
      supabase.from('empresas').select('*').order('nome').then(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((d: any) => this.map(d));
      })
    );
  }

  criar(e: Empresa) {
    return from(
      supabase.from('empresas').insert({
        nome: e.nome,
        telefone: e.telefone || null,
        valor_mensalidade: e.valorMensalidade || null,
        data_vencimento: e.dataVencimento || null,
        ativo: true
      }).select().single().then(({ data, error }) => {
        if (error) throw error;
        return this.map(data);
      })
    );
  }

  atualizar(id: number, e: Empresa) {
    return from(
      supabase.from('empresas').update({
        nome: e.nome,
        telefone: e.telefone || null,
        valor_mensalidade: e.valorMensalidade || null,
        data_vencimento: e.dataVencimento || null
      }).eq('id', id).select().single().then(({ data, error }) => {
        if (error) throw error;
        return this.map(data);
      })
    );
  }

  alternarAtivo(id: number) {
    return from(this.doAlternarAtivo(id));
  }

  private async doAlternarAtivo(id: number): Promise<Empresa> {
    const { data: cur } = await supabase.from('empresas').select('ativo').eq('id', id).single();
    const { data, error } = await supabase.from('empresas')
      .update({ ativo: !cur?.ativo }).eq('id', id).select().single();
    if (error) throw error;
    return this.map(data);
  }

  deletar(id: number) {
    return from(
      supabase.from('empresas').delete().eq('id', id).then(({ error }) => {
        if (error) throw error;
      })
    );
  }

  private map(d: any): Empresa {
    return {
      id: d.id,
      nome: d.nome,
      telefone: d.telefone,
      valorMensalidade: d.valor_mensalidade,
      dataVencimento: d.data_vencimento,
      ativo: d.ativo,
      createdAt: d.created_at
    };
  }
}
