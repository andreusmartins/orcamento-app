import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  usuarios: Usuario[] = [];
  carregando = false;
  sucesso = '';
  erro = '';

  // Novo usuário
  novo = { nome: '', email: '', senha: '' };
  criando = false;
  mostrarForm = false;

  // Alterar senha
  senhaMap: { [id: number]: string } = {};

  constructor(
    private usuarioService: UsuarioService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.usuarioService.listar().subscribe({
      next: u => { this.usuarios = u; this.carregando = false; },
      error: () => this.carregando = false
    });
  }

  criarUsuario() {
    if (!this.novo.nome || !this.novo.email || !this.novo.senha) {
      this.erro = 'Preencha todos os campos';
      return;
    }
    this.criando = true;
    this.erro = '';
    this.usuarioService.criar(this.novo).subscribe({
      next: () => {
        this.sucesso = `Usuário ${this.novo.nome} criado com sucesso!`;
        this.novo = { nome: '', email: '', senha: '' };
        this.mostrarForm = false;
        this.criando = false;
        this.carregar();
        setTimeout(() => this.sucesso = '', 4000);
      },
      error: (e) => {
        this.erro = e.error?.erro || 'Erro ao criar usuário';
        this.criando = false;
      }
    });
  }

  alternarAtivo(u: Usuario) {
    this.usuarioService.alterarAtivo(u.id, !u.ativo).subscribe(() => this.carregar());
  }

  alterarSenha(u: Usuario) {
    const nova = this.senhaMap[u.id];
    if (!nova || nova.length < 4) {
      this.erro = 'A senha deve ter pelo menos 4 caracteres';
      return;
    }
    this.usuarioService.alterarSenha(u.id, nova).subscribe({
      next: () => {
        this.senhaMap[u.id] = '';
        this.sucesso = `Senha de ${u.nome} alterada!`;
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: () => this.erro = 'Erro ao alterar senha'
    });
  }

  excluir(u: Usuario) {
    if (!confirm(`Excluir o usuário ${u.nome}? Esta ação não pode ser desfeita.`)) return;
    this.usuarioService.excluir(u.id).subscribe(() => this.carregar());
  }

  irParaSistema() {
    this.router.navigate(['/novo-orcamento']);
  }

  sair() {
    this.auth.logout();
  }
}
