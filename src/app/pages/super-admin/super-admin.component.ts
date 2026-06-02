import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmpresaService, Empresa } from '../../core/services/empresa.service';
import { UsuarioService, Usuario } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-super-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './super-admin.component.html'
})
export class SuperAdminComponent implements OnInit {
  empresas: Empresa[] = [];
  carregando = false;
  sucesso = '';
  erro = '';

  mostrarForm = false;
  editando: Empresa | null = null;

  form: Empresa = this.novoForm();

  // Gerenciar usuários de uma empresa
  empresaSelecionadaId: number | null = null;
  usuarios: Usuario[] = [];
  mostrarUsuarios = false;
  mostrarFormUsuario = false;
  novoUsuario = { nome: '', email: '', senha: '' };
  criandoUsuario = false;
  senhaMap: { [id: number]: string } = {};

  constructor(
    private empresaService: EmpresaService,
    private usuarioService: UsuarioService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.carregando = true;
    this.empresaService.listar().subscribe({
      next: e => { this.empresas = e; this.carregando = false; },
      error: () => this.carregando = false
    });
  }

  abrirNova() {
    this.editando = null;
    this.form = this.novoForm();
    this.mostrarForm = true;
  }

  abrirEditar(e: Empresa) {
    this.editando = e;
    this.form = { ...e };
    this.mostrarForm = true;
  }

  salvar() {
    if (!this.form.nome) { this.erro = 'Informe o nome da empresa'; return; }
    this.erro = '';
    const obs = this.editando?.id
      ? this.empresaService.atualizar(this.editando.id, this.form)
      : this.empresaService.criar(this.form);
    obs.subscribe({
      next: () => {
        this.sucesso = this.editando ? 'Empresa atualizada!' : 'Empresa criada!';
        this.mostrarForm = false;
        this.carregar();
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: () => this.erro = 'Erro ao salvar empresa'
    });
  }

  alternarAtivo(e: Empresa) {
    this.empresaService.alternarAtivo(e.id!).subscribe(() => this.carregar());
  }

  deletar(e: Empresa) {
    if (!confirm(`Excluir a empresa "${e.nome}"? Isso não pode ser desfeito.`)) return;
    this.empresaService.deletar(e.id!).subscribe(() => this.carregar());
  }

  abrirUsuarios(e: Empresa) {
    this.empresaSelecionadaId = e.id!;
    this.mostrarUsuarios = true;
    this.mostrarFormUsuario = false;
    this.usuarioService.listar().subscribe(lista => {
      this.usuarios = lista.filter((u: Usuario) => (u as any).empresa?.id === e.id || (u as any).empresaId === e.id);
    });
  }

  fecharUsuarios() {
    this.mostrarUsuarios = false;
    this.empresaSelecionadaId = null;
    this.usuarios = [];
  }

  criarUsuario() {
    if (!this.novoUsuario.nome || !this.novoUsuario.email || !this.novoUsuario.senha) {
      this.erro = 'Preencha todos os campos'; return;
    }
    this.criandoUsuario = true;
    this.usuarioService.criar({
      ...this.novoUsuario,
      empresaId: String(this.empresaSelecionadaId)
    } as any).subscribe({
      next: () => {
        this.sucesso = 'Usuário criado!';
        this.novoUsuario = { nome: '', email: '', senha: '' };
        this.mostrarFormUsuario = false;
        this.criandoUsuario = false;
        this.abrirUsuarios(this.empresas.find(e => e.id === this.empresaSelecionadaId)!);
        setTimeout(() => this.sucesso = '', 3000);
      },
      error: (e) => {
        this.erro = e.error?.erro || 'Erro ao criar usuário';
        this.criandoUsuario = false;
      }
    });
  }

  alternarAtivoUsuario(u: Usuario) {
    this.usuarioService.alterarAtivo(u.id, !u.ativo).subscribe(() =>
      this.abrirUsuarios(this.empresas.find(e => e.id === this.empresaSelecionadaId)!)
    );
  }

  alterarSenha(u: Usuario) {
    const nova = this.senhaMap[u.id];
    if (!nova || nova.length < 4) { this.erro = 'Senha deve ter ao menos 4 caracteres'; return; }
    this.usuarioService.alterarSenha(u.id, nova).subscribe(() => {
      this.senhaMap[u.id] = '';
      this.sucesso = `Senha de ${u.nome} alterada!`;
      setTimeout(() => this.sucesso = '', 3000);
    });
  }

  vencimentoClasse(e: Empresa): string {
    if (!e.dataVencimento) return 'text-gray-400';
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const venc = new Date(e.dataVencimento + 'T00:00:00');
    const diff = Math.ceil((venc.getTime() - hoje.getTime()) / 86400000);
    if (diff < 0) return 'text-red-600 font-bold';
    if (diff <= 7) return 'text-orange-500 font-bold';
    return 'text-green-600';
  }

  dataLabel(data?: string): string {
    if (!data) return 'Sem vencimento';
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  empresaNome(): string {
    return this.empresas.find(e => e.id === this.empresaSelecionadaId)?.nome || '';
  }

  get empresasAtivas(): number {
    return this.empresas.filter(e => e.ativo).length;
  }

  get empresasVencidas(): number {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    return this.empresas.filter(e => {
      if (!e.dataVencimento) return false;
      return new Date(e.dataVencimento + 'T00:00:00') < hoje;
    }).length;
  }

  sair() { this.auth.logout(); }

  private novoForm(): Empresa {
    return { nome: '', telefone: '', valorMensalidade: undefined, dataVencimento: '', ativo: true };
  }
}
