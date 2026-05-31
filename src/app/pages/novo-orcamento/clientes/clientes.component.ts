import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { Cliente } from '../../../core/models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  mostrarFormulario = false;
  carregando = false;
  editando: Cliente | null = null;

  form: Cliente = { nome: '', telefone: '', endereco: '' };

  constructor(private clienteService: ClienteService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.clienteService.listar().subscribe(c => this.clientes = c);
  }

  abrirFormulario() {
    this.form = { nome: '', telefone: '', endereco: '' };
    this.editando = null;
    this.mostrarFormulario = true;
  }

  editar(cliente: Cliente) {
    this.form = { ...cliente };
    this.editando = cliente;
    this.mostrarFormulario = true;
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.editando = null;
  }

  salvar() {
    if (!this.form.nome || !this.form.telefone) return;
    this.carregando = true;

    const acao = this.editando?.id
      ? this.clienteService.atualizar(this.editando.id!, this.form)
      : this.clienteService.criar(this.form);

    acao.subscribe({
      next: () => {
        this.carregar();
        this.cancelar();
        this.carregando = false;
      },
      error: () => this.carregando = false
    });
  }

  deletar(id: number) {
    if (!confirm('Deseja remover este cliente?')) return;
    this.clienteService.deletar(id).subscribe(() => this.carregar());
  }

  whatsappLink(cliente: Cliente): string {
    const numero = cliente.telefone.replace(/\D/g, '');
    return `https://wa.me/55${numero}`;
  }

  formatarTelefone(event: any) {
    let v = event.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length >= 7) {
      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    } else if (v.length >= 3) {
      v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    }
    this.form.telefone = v;
  }
}
