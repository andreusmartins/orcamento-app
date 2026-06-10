import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgendaPayload, OrcamentoService } from '../../core/services/orcamento.service';
import { Orcamento, StatusOrcamento } from '../../core/models/orcamento.model';

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicos.component.html'
})
export class ServicosComponent implements OnInit {
  orcamentos: Orcamento[] = [];
  filtro: 'todos' | StatusOrcamento | 'servicos' = 'todos';
  editandoAgendaId: number | null = null;
  busca = '';
  carregando = false;
  erroRede = false;

  agendaForm: AgendaPayload = this.novaAgenda();

  readonly statusOptions: StatusOrcamento[] = ['pendente', 'aprovado', 'recusado', 'executado'];
  readonly filtros: Array<'todos' | StatusOrcamento | 'servicos'> = ['todos', 'pendente', 'aprovado', 'recusado', 'executado', 'servicos'];

  constructor(private orcamentoService: OrcamentoService) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erroRede = false;
    this.orcamentoService.listar().subscribe({
      next: orcamentos => {
        this.orcamentos = orcamentos;
        this.carregando = false;
      },
      error: () => { this.carregando = false; this.erroRede = true; }
    });
  }

  get filtrados(): Orcamento[] {
    let lista: Orcamento[];
    if (this.filtro === 'todos') lista = this.orcamentos;
    else if (this.filtro === 'servicos') lista = this.orcamentos.filter(o => o.ordemServico);
    else lista = this.orcamentos.filter(o => o.status === this.filtro);

    if (this.busca.trim()) {
      const b = this.busca.toLowerCase();
      lista = lista.filter(o =>
        (o.cliente?.nome || '').toLowerCase().includes(b) ||
        (o.tipoServico || '').toLowerCase().includes(b)
      );
    }
    return this.ordenados(lista);
  }

  total(o: Orcamento): number {
    return o.itens?.reduce((acc, item) => acc + (item.valor || 0), 0) || 0;
  }

  atualizarStatus(o: Orcamento, status: StatusOrcamento) {
    if (!o.id || o.status === status) return;
    this.orcamentoService.atualizarStatus(o.id, status).subscribe(() => this.carregar());
  }

  transformar(o: Orcamento) {
    if (!o.id) return;
    this.orcamentoService.transformarEmServico(o.id).subscribe(() => this.carregar());
  }

  abrirAgenda(o: Orcamento) {
    this.editandoAgendaId = o.id || null;
    this.agendaForm = {
      tipoServico: o.tipoServico || '',
      dataVisita: this.paraInputDataHora(o.dataVisita),
      dataServico: this.paraInputDataHora(o.dataServico),
      dataRetorno: this.paraInputDataHora(o.dataRetorno),
      observacoesAgenda: o.observacoesAgenda || ''
    };
  }

  salvarAgenda() {
    if (!this.editandoAgendaId) return;
    this.orcamentoService.atualizarAgenda(this.editandoAgendaId, this.agendaForm).subscribe(() => {
      this.editandoAgendaId = null;
      this.agendaForm = this.novaAgenda();
      this.carregar();
    });
  }

  cancelarAgenda() {
    this.editandoAgendaId = null;
    this.agendaForm = this.novaAgenda();
  }

  badgeClasse(status?: string): string {
    const classes: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-700',
      aprovado: 'bg-green-100 text-green-700',
      recusado: 'bg-red-100 text-red-700',
      executado: 'bg-blue-100 text-blue-700'
    };
    return classes[status || 'pendente'] || 'bg-gray-100 text-gray-600';
  }

  statusLabel(status?: string): string {
    const labels: Record<string, string> = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      recusado: 'Recusado',
      executado: 'Executado'
    };
    return labels[status || 'pendente'] || 'Pendente';
  }

  dataLabel(data?: string): string {
    if (!data) return 'Nao marcado';
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private ordenados(orcamentos: Orcamento[]): Orcamento[] {
    return [...orcamentos].sort((a, b) => {
      const dataA = a.dataServico || a.dataVisita || a.createdAt || '';
      const dataB = b.dataServico || b.dataVisita || b.createdAt || '';
      return dataB.localeCompare(dataA);
    });
  }

  private paraInputDataHora(data?: string): string {
    if (!data) return '';
    return data.slice(0, 16);
  }

  private novaAgenda(): AgendaPayload {
    return {
      tipoServico: '',
      dataVisita: '',
      dataServico: '',
      dataRetorno: '',
      observacoesAgenda: ''
    };
  }
}
