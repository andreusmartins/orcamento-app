import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'ADMIN' | 'CLIENTE' | 'SUPER_ADMIN';
  ativo: boolean;
  empresa?: { id: number; nome: string };
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private api = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar() { return this.http.get<Usuario[]>(this.api); }

  criar(dados: { nome: string; email: string; senha: string; empresaId?: string }) {
    return this.http.post<Usuario>(this.api, dados);
  }

  alterarAtivo(id: number, ativo: boolean) {
    return this.http.put<Usuario>(`${this.api}/${id}/ativo`, { ativo });
  }

  alterarSenha(id: number, senha: string) {
    return this.http.put(`${this.api}/${id}/senha`, { senha });
  }

  excluir(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
