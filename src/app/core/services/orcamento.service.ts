import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Orcamento, StatusOrcamento } from '../models/orcamento.model';

export type OrcamentoPayload = Pick<Orcamento,
  'clienteId' | 'itens' | 'status' | 'tipoServico' | 'dataVisita' | 'dataServico' | 'dataRetorno' | 'observacoesAgenda'
>;

export type AgendaPayload = Pick<Orcamento, 'tipoServico' | 'dataVisita' | 'dataServico' | 'dataRetorno' | 'observacoesAgenda'>;

@Injectable({ providedIn: 'root' })
export class OrcamentoService {
  private api = `${environment.apiUrl}/orcamentos`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Orcamento[]>(this.api);
  }

  criar(orcamento: OrcamentoPayload) {
    return this.http.post<Orcamento>(this.api, orcamento);
  }

  atualizarStatus(id: number, status: StatusOrcamento) {
    return this.http.patch<Orcamento>(`${this.api}/${id}/status?status=${status}`, {});
  }

  atualizarAgenda(id: number, agenda: AgendaPayload) {
    return this.http.patch<Orcamento>(`${this.api}/${id}/agenda`, agenda);
  }

  transformarEmServico(id: number) {
    return this.http.patch<Orcamento>(`${this.api}/${id}/servico`, {});
  }

  deletar(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
