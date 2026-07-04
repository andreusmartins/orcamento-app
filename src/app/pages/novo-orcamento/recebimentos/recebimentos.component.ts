import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecebimentoService } from '../../../core/services/recebimento.service';
import { OrcamentoService } from '../../../core/services/orcamento.service';
import { Recebimento, StatusRecebimento } from '../../../core/models/recebimento.model';
import { Orcamento } from '../../../core/models/orcamento.model';

@Component({
  selector: 'app-recebimentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recebimentos.component.html'
})
export class RecebimentosComponent implements OnInit {
  recebimentos: Recebimento[] = [];
  orcamentos: Orcamento[] = [];
  filtro: 'todos' | StatusRecebimento = 'todos';
  mostrarFormulario = false;
  carregando = false;
  erro = '';

  readonly statusOptions: StatusRecebimento[] = ['pago', 'parcial', 'pendente', 'vencido'];
  readonly filtros: Array<'todos' | StatusRecebimento> = ['todos', 'pago', 'parcial', 'pendente', 'vencido'];
  readonly formasPagamento = ['Pix', 'Dinheiro', 'Cartão', 'Boleto', 'Transferência'];

  form = this.novoForm();

  constructor(
    private recebimentoService: RecebimentoService,
    private orcamentoService: OrcamentoService
  ) {}

  ngOnInit() {
    this.carregar();
    this.orcamentoService.listar().subscribe(o => this.orcamentos = o);
  }

  carregar() {
    this.recebimentoService.listar().subscribe(r => this.recebimentos = r);
  }

  get recebimentosFiltrados(): Recebimento[] {
    const lista = this.recebimentos.map(r => ({ ...r, status: this.statusCalculado(r) }));
    if (this.filtro === 'todos') return lista;
    return lista.filter(r => r.status === this.filtro);
  }

  get totalPago(): number {
    return this.recebimentos
      .filter(r => r.status === 'pago')
      .reduce((acc, r) => acc + r.valor, 0);
  }

  get totalPendente(): number {
    return this.recebimentos
      .filter(r => this.statusCalculado(r) !== 'pago')
      .reduce((acc, r) => acc + r.valor, 0);
  }

  abrirFormulario() {
    this.erro = '';
    this.form = this.novoForm();
    this.mostrarFormulario = true;
  }

  cancelar() {
    this.mostrarFormulario = false;
  }

  salvar() {
    if (!this.form.orcamentoId || !this.form.valor) return;
    this.carregando = true;

    this.recebimentoService.criar({
      orcamentoId: this.form.orcamentoId,
      valor: this.form.valor,
      status: this.form.status,
      formaPagamento: this.form.formaPagamento,
      pix: this.form.pix,
      dataVencimento: this.form.dataVencimento,
      observacao: this.form.observacao
    }).subscribe({
      next: () => {
        this.carregar();
        this.cancelar();
        this.carregando = false;
      },
      error: (e: any) => { this.erro = e?.message || 'Erro ao salvar. Tente novamente.'; this.carregando = false; }
    });
  }

  atualizarStatus(id: number, status: StatusRecebimento) {
    this.recebimentoService.atualizarStatus(id, status).subscribe(() => this.carregar());
  }

  deletar(id: number) {
    if (!confirm('Deseja remover este recebimento?')) return;
    this.recebimentoService.deletar(id).subscribe(() => this.carregar());
  }

  badgeClasse(status: string): string {
    const classes: Record<string, string> = {
      pago: 'bg-green-100 text-green-700',
      pendente: 'bg-yellow-100 text-yellow-700',
      parcial: 'bg-blue-100 text-blue-700',
      vencido: 'bg-red-100 text-red-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-600';
  }

  nomeCliente(r: Recebimento): string {
    return r.orcamento?.cliente?.nome || 'Cliente';
  }

  totalOrcamentoByObj(o: Orcamento): number {
    return o?.itens?.reduce((acc, i) => acc + i.valor, 0) || 0;
  }

  totalOrcamento(r: Recebimento): number {
    // itens vem ignorado pelo backend no relacionamento, busca da lista local
    const orcamento = this.orcamentos.find(o => o.id === r.orcamento?.id);
    return orcamento?.itens?.reduce((acc, i) => acc + i.valor, 0) || 0;
  }

  statusCalculado(r: Recebimento): StatusRecebimento {
    if (r.status === 'pendente' && r.dataVencimento) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const vencimento = new Date(`${r.dataVencimento}T00:00:00`);
      if (vencimento < hoje) return 'vencido';
    }
    return r.status;
  }

  dataLabel(data?: string): string {
    if (!data) return 'Sem vencimento';
    return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR');
  }

  private novoForm() {
    return {
      orcamentoId: null as number | null,
      valor: null as number | null,
      status: 'pendente' as StatusRecebimento,
      formaPagamento: 'Pix',
      pix: '',
      dataVencimento: '',
      observacao: ''
    };
  }
}
