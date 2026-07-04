import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { supabase } from '../supabase/supabase.client';
import { Orcamento, StatusOrcamento } from '../models/orcamento.model';

export type OrcamentoPayload = Pick<Orcamento,
  'clienteId' | 'itens' | 'status' | 'tipoServico' | 'dataVisita' | 'dataServico' | 'dataRetorno' | 'observacoesAgenda'
>;

export type AgendaPayload = Pick<Orcamento,
  'tipoServico' | 'dataVisita' | 'dataServico' | 'dataRetorno' | 'observacoesAgenda'
>;

@Injectable({ providedIn: 'root' })
export class OrcamentoService {

  listar() {
    return from(
      supabase.from('orcamentos')
        .select('*, cliente:clientes(*), itens:itens_orcamento(*)')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return (data || []).map((o: any) => this.mapOrcamento(o));
        })
    );
  }

  criar(payload: OrcamentoPayload) {
    return from(this.doCriar(payload));
  }

  private async doCriar(payload: OrcamentoPayload): Promise<Orcamento> {
    const { data: orc, error: orcErr } = await supabase.from('orcamentos').insert({
      cliente_id: payload.clienteId,
      status: payload.status || 'pendente',
      tipo_servico: payload.tipoServico || null,
      data_visita: payload.dataVisita || null,
      data_servico: payload.dataServico || null,
      data_retorno: payload.dataRetorno || null,
      observacoes_agenda: payload.observacoesAgenda || null
    }).select().single();
    if (orcErr) throw orcErr;

    if (payload.itens && payload.itens.length > 0) {
      const itens = payload.itens.map((i: any) => ({
        orcamento_id: orc.id,
        descricao: i.descricao,
        valor: i.valor,
        observacao: i.observacao || null
      }));
      const { error: itensErr } = await supabase.from('itens_orcamento').insert(itens);
      if (itensErr) throw itensErr;
    }

    return this.mapOrcamento({ ...orc, itens: payload.itens || [], cliente: null });
  }

  atualizarStatus(id: number, status: StatusOrcamento) {
    return from(
      supabase.from('orcamentos').update({ status }).eq('id', id).select().single()
        .then(({ data, error }) => {
          if (error) throw error;
          return this.mapOrcamento(data);
        })
    );
  }

  atualizarAgenda(id: number, agenda: AgendaPayload) {
    return from(
      supabase.from('orcamentos').update({
        tipo_servico: agenda.tipoServico || null,
        data_visita: agenda.dataVisita || null,
        data_servico: agenda.dataServico || null,
        data_retorno: agenda.dataRetorno || null,
        observacoes_agenda: agenda.observacoesAgenda || null
      }).eq('id', id).select().single().then(({ data, error }) => {
        if (error) throw error;
        return this.mapOrcamento(data);
      })
    );
  }

  transformarEmServico(id: number) {
    return from(
      supabase.from('orcamentos')
        .update({ ordem_servico: true, status: 'aprovado' })
        .eq('id', id).select().single()
        .then(({ data, error }) => {
          if (error) throw error;
          return this.mapOrcamento(data);
        })
    );
  }

  deletar(id: number) {
    return from(
      supabase.from('orcamentos').delete().eq('id', id).then(({ error }) => {
        if (error) throw error;
      })
    );
  }

  private mapOrcamento(o: any): Orcamento {
    const itens = (o.itens || []).map((i: any) => ({
      id: i.id,
      descricao: i.descricao,
      valor: Number(i.valor),
      observacao: i.observacao
    }));
    return {
      id: o.id,
      clienteId: o.cliente_id,
      cliente: o.cliente,
      itens,
      status: o.status,
      tipoServico: o.tipo_servico,
      dataVisita: o.data_visita,
      dataServico: o.data_servico,
      dataRetorno: o.data_retorno,
      observacoesAgenda: o.observacoes_agenda,
      ordemServico: o.ordem_servico,
      createdAt: o.created_at
    };
  }
}
