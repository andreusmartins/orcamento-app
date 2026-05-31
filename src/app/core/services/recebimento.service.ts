import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
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
  private api = `${environment.apiUrl}/recebimentos`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Recebimento[]>(this.api);
  }

  criar(dto: RecebimentoPayload) {
    return this.http.post<Recebimento>(this.api, dto);
  }

  atualizarStatus(id: number, status: StatusRecebimento) {
    return this.http.patch<Recebimento>(`${this.api}/${id}/status?status=${status}`, {});
  }

  deletar(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
