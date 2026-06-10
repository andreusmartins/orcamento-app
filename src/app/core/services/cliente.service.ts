import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cliente } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private api = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  listar() {
    return this.http.get<Cliente[]>(this.api);
  }

  list() {
    return this.listar();
  }

  buscarPorId(id: number) {
    return this.http.get<Cliente>(`${this.api}/${id}`);
  }

  criar(cliente: Cliente) {
    return this.http.post<Cliente>(this.api, cliente);
  }

  atualizar(id: number, cliente: Cliente) {
    return this.http.put<Cliente>(`${this.api}/${id}`, cliente);
  }

  deletar(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
