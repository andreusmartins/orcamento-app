import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { supabase } from '../supabase/supabase.client';
import { Recebimento, StatusRecebimento } from '../models/recebimento.model';

export interface RecebimentoPayload {
  orcamentoId: number;
  valor: number;
  status: StatusRecebimento;
  formaPagamento?: string;
  pix?: string;
  dataVencimento?: string;
  observacao?: string;
}

@Injectable({ providedIn: 'root' })
export class RecebimentoService {

  listar() {
    return from(
      supabase.from('recebimentos')
        .select('*, orcamento:orcamentos(*, cliente:clientes(*), itens:itens_orcamento(*))')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return (data || []).map((r: any) => this.mapRecebimento(r));
        })
    );
  }

  criar(dto: RecebimentoPayload) {
    return from(
      supabase.from('recebimentos').insert({
        orcamento_id: dto.orcamentoId,
        valor: dto.valor,
        status: dto.status,
        forma_pagamento: dto.formaPagamento || null,
        pix: dto.pix || null,
        data_vencimento: dto.dataVencimento || null,
        observacao: dto.observacao || null
      })
      .select('*, orcamento:orcamentos(*, cliente:clientes(*), itens:itens_orcamento(*))')
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return this.mapRecebimento(data);
      })
    );
  }

  atualizarStatus(id: number, status: StatusRecebimento) {
    return from(
      supabase.from('recebimentos').update({ status }).eq('id', id).select().single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as Recebimento;
        })
    );
  }

  deletar(id: number) {
    return from(
      supabase.from('recebimentos').delete().eq('id', id).then(({ error }) => {
        if (error) throw error;
      })
    );
  }

  private mapRecebimento(r: any): Recebimento {
    const orc = r.orcamento;
    const orcamento: Recebimento['orcamento'] = orc ? {
      id: orc.id,
      clienteId: orc.cliente_id,
      cliente: orc.cliente,
      itens: (orc.itens || []).map((i: any) => ({
        id: i.id,
        descricao: i.descricao,
        valor: Number(i.valor),
        observacao: i.observacao
      })),
      status: orc.status,
      tipoServico: orc.tipo_servico
    } : undefined;

    return {
      id: r.id,
      orcamento,
      valor: Number(r.valor),
      status: r.status,
      formaPagamento: r.forma_pagamento,
      pix: r.pix,
      dataVencimento: r.data_vencimento,
      observacao: r.observacao,
      createdAt: r.created_at
    };
  }
}
