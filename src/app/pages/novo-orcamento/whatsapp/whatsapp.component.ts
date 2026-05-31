import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../../core/services/cliente.service';
import { OrcamentoService } from '../../../core/services/orcamento.service';
import { Cliente } from '../../../core/models/cliente.model';
import { Orcamento } from '../../../core/models/orcamento.model';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whatsapp.component.html'
})
export class WhatsappComponent implements OnInit {
  clientes: Cliente[] = [];
  orcamentos: Orcamento[] = [];
  busca = '';
  clienteSelecionado: Cliente | null = null;
  mensagemPersonalizada = '';

  mensagensRapidas = [
    {
      label: 'Segue orcamento',
      icone: 'R$',
      texto: (nome: string) => `Ola ${nome}! Segue o orcamento conforme combinado. Qualquer duvida fico a disposicao.`
    },
    {
      label: 'Agendar amanha',
      icone: 'AG',
      texto: (nome: string) => `Ola ${nome}! Posso agendar para amanha? Se preferir, me diga o melhor horario.`
    },
    {
      label: 'Servico concluido',
      icone: 'OK',
      texto: (nome: string) => `Ola ${nome}! Seu servico foi concluido. Obrigado pela confianca.`
    },
    {
      label: 'Pagamento pendente',
      icone: '$$',
      texto: (nome: string) => `Ola ${nome}! Passando para lembrar que o pagamento do servico esta pendente. Posso te enviar a chave Pix?`
    }
  ];

  constructor(
    private clienteService: ClienteService,
    private orcamentoService: OrcamentoService
  ) {}

  ngOnInit() {
    this.clienteService.listar().subscribe(c => this.clientes = c);
    this.orcamentoService.listar().subscribe(o => this.orcamentos = o);
  }

  get clientesFiltrados(): Cliente[] {
    if (!this.busca) return this.clientes;
    return this.clientes.filter(c =>
      c.nome.toLowerCase().includes(this.busca.toLowerCase()) ||
      c.telefone.includes(this.busca)
    );
  }

  selecionar(cliente: Cliente) {
    this.clienteSelecionado = cliente;
    this.mensagemPersonalizada = '';
  }

  voltar() {
    this.clienteSelecionado = null;
    this.mensagemPersonalizada = '';
  }

  enviarMensagem(texto: string) {
    if (!this.clienteSelecionado?.telefone) return;
    const numero = this.clienteSelecionado.telefone.replace(/\D/g, '');
    window.open(
      `https://wa.me/55${numero}?text=${encodeURIComponent(texto)}`,
      '_blank'
    );
  }

  enviarPersonalizada() {
    if (!this.mensagemPersonalizada.trim()) return;
    this.enviarMensagem(this.mensagemPersonalizada);
  }

  orcamentosDoCliente(): Orcamento[] {
    if (!this.clienteSelecionado) return [];
    return this.orcamentos
      .filter(o => o.cliente?.id === this.clienteSelecionado!.id)
      .slice(0, 3);
  }

  totalOrcamento(o: Orcamento): number {
    return o.itens?.reduce((acc, i) => acc + i.valor, 0) || 0;
  }

  badgeClasse(status?: string): string {
    const classes: Record<string, string> = {
      pago: 'bg-green-100 text-green-700',
      parcial: 'bg-blue-100 text-blue-700',
      vencido: 'bg-red-100 text-red-700',
      pendente: 'bg-yellow-100 text-yellow-700',
      aprovado: 'bg-green-100 text-green-700',
      recusado: 'bg-red-100 text-red-700',
      executado: 'bg-blue-100 text-blue-700'
    };
    return classes[status || 'pendente'] || 'bg-gray-100 text-gray-600';
  }

  enviarOrcamento(o: Orcamento) {
    const total = this.totalOrcamento(o).toFixed(2);
    const servico = o.tipoServico ? ` de ${o.tipoServico}` : '';
    const agenda = o.dataServico ? ` Servico agendado para ${new Date(o.dataServico).toLocaleString('pt-BR')}.` : '';
    const texto = `Ola ${this.clienteSelecionado?.nome}! Segue o orcamento #${o.id}${servico} no valor de R$ ${total}.${agenda}`;
    this.enviarMensagem(texto);
  }
}
