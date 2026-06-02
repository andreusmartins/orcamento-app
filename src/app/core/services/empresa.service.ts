import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  private api = `${environment.apiUrl}/empresas`;

  constructor(private http: HttpClient) {}

  listar() { return this.http.get<Empresa[]>(this.api); }
  criar(e: Empresa) { return this.http.post<Empresa>(this.api, e); }
  atualizar(id: number, e: Empresa) { return this.http.put<Empresa>(`${this.api}/${id}`, e); }
  alternarAtivo(id: number) { return this.http.patch<Empresa>(`${this.api}/${id}/ativo`, {}); }
  deletar(id: number) { return this.http.delete(`${this.api}/${id}`); }
}
