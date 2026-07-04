import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../../core/services/cliente.service';
import { OrcamentoService } from '../../core/services/orcamento.service';
import { Cliente } from '../../core/models/cliente.model';
import jsPDF from 'jspdf';

interface Item {
  descricao: string;
  valor: number | null;
  observacao: string;
}

interface EmpresaConfig {
  nome: string;
  telefone: string;
  endereco: string;
  documento: string;
  pix: string;
  logo: string;
}

@Component({
  selector: 'app-novo-orcamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './novo-orcamento.component.html'
})
export class NovoOrcamentoComponent implements OnInit {

  temAlteracoesNaoSalvas(): boolean {
    const temCliente = !!this.clienteSelecionado;
    const temItens = this.itens.some(i => i.descricao.trim() || (i.valor && i.valor > 0));
    return (temCliente || temItens) && !this.orcamentoSalvoId;
  }

  clientes: Cliente[] = [];
  clienteSelecionado: number | null = null;
  itens: Item[] = [{ descricao: '', valor: null, observacao: '' }];
  sucesso = false;
  carregando = false;
  mostrarEmpresa = false;
  erroValidacao = '';
  erroSalvar = '';
  orcamentoSalvoId: number | null = null;

  agenda = {
    tipoServico: '',
    dataVisita: '',
    dataServico: '',
    dataRetorno: '',
    observacoesAgenda: ''
  };

  empresa: EmpresaConfig = {
    nome: '',
    telefone: '',
    endereco: '',
    documento: '',
    pix: '',
    logo: ''
  };

  constructor(
    private clienteService: ClienteService,
    private orcamentoService: OrcamentoService
  ) {}

  ngOnInit() {
    this.clienteService.listar().subscribe(c => this.clientes = c);
    this.carregarEmpresa();
  }

  adicionarItem() {
    this.itens.push({ descricao: '', valor: null, observacao: '' });
  }

  removerItem(index: number) {
    if (this.itens.length > 1) this.itens.splice(index, 1);
  }

  get total(): number {
    return this.itens.reduce((acc, item) => acc + (item.valor || 0), 0);
  }

  get clienteNome(): string {
    return this.clientes.find(c => c.id === Number(this.clienteSelecionado))?.nome || '';
  }

  salvarEmpresa() {
    localStorage.setItem('empresaConfig', JSON.stringify(this.empresa));
    this.mostrarEmpresa = false;
  }

  carregarLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.empresa.logo = String(reader.result || '');
      this.salvarEmpresa();
    };
    reader.readAsDataURL(arquivo);
  }

  salvar() {
    this.erroValidacao = '';
    this.erroSalvar = '';
    if (!this.clienteSelecionado) return;

    const itemInvalido = this.itens.find(i => !i.descricao.trim() || !i.valor || i.valor <= 0);
    if (itemInvalido) {
      this.erroValidacao = 'Preencha a descrição e o valor de todos os itens do orçamento.';
      return;
    }

    this.carregando = true;
    const payload = {
      clienteId: this.clienteSelecionado,
      status: 'pendente' as const,
      tipoServico: this.agenda.tipoServico,
      dataVisita: this.agenda.dataVisita,
      dataServico: this.agenda.dataServico,
      dataRetorno: this.agenda.dataRetorno,
      observacoesAgenda: this.agenda.observacoesAgenda,
      itens: this.itens.map(i => ({
        descricao: i.descricao,
        valor: i.valor || 0,
        observacao: i.observacao
      }))
    };

    this.orcamentoService.criar(payload).subscribe({
      next: (orcamento) => {
        this.sucesso = true;
        this.orcamentoSalvoId = orcamento.id || null;
        this.carregando = false;
        setTimeout(() => this.sucesso = false, 4000);
      },
      error: (e: any) => {
        this.erroSalvar = e?.message || 'Erro ao salvar orçamento. Tente novamente.';
        this.carregando = false;
      }
    });
  }

  gerarPDF() {
    const doc = new jsPDF();
    const hoje = new Date().toLocaleDateString('pt-BR');
    const validade = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR');
    let y = 18;

    if (this.empresa.logo) {
      try {
        doc.addImage(this.empresa.logo, 'PNG', 14, 10, 26, 26);
      } catch {
        // Logo invalido nao deve impedir o PDF.
      }
    }

    doc.setFontSize(18);
    doc.text(this.empresa.nome || 'Orcamento', 105, y, { align: 'center' });
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(90);
    const dadosEmpresa = [
      this.empresa.telefone,
      this.empresa.documento,
      this.empresa.endereco
    ].filter(Boolean).join(' | ');
    if (dadosEmpresa) {
      doc.text(dadosEmpresa, 105, y, { align: 'center', maxWidth: 170 });
      y += 10;
    }
    doc.setTextColor(0);

    doc.setFontSize(15);
    doc.text('Orcamento', 105, y, { align: 'center' });
    y += 14;

    doc.setFontSize(11);
    doc.text(`Cliente: ${this.clienteNome}`, 14, y);
    y += 8;
    doc.text(`Data: ${hoje}`, 14, y);
    doc.text(`Valido ate: ${validade}`, 120, y);
    y += 8;
    if (this.agenda.tipoServico) {
      doc.text(`Servico: ${this.agenda.tipoServico}`, 14, y);
      y += 8;
    }
    if (this.agenda.dataServico) {
      doc.text(`Servico agendado: ${new Date(this.agenda.dataServico).toLocaleString('pt-BR')}`, 14, y);
      y += 8;
    }

    doc.setFontSize(12);
    doc.text('Itens', 14, y + 4);
    y += 8;
    doc.line(14, y, 196, y);
    y += 9;

    this.itens.forEach((item, i) => {
      doc.setFontSize(11);
      doc.text(`${i + 1}. ${item.descricao}`, 14, y);
      doc.text(`R$ ${(item.valor || 0).toFixed(2)}`, 190, y, { align: 'right' });
      if (item.observacao) {
        y += 6;
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(item.observacao, 18, y, { maxWidth: 160 });
        doc.setTextColor(0);
      }
      y += 10;
    });

    doc.line(14, y, 196, y);
    y += 8;
    doc.setFontSize(14);
    doc.text(`Total: R$ ${this.total.toFixed(2)}`, 190, y, { align: 'right' });
    y += 10;

    if (this.empresa.pix) {
      doc.setFontSize(11);
      doc.text(`Pix: ${this.empresa.pix}`, 14, y);
      y += 8;
    }

    if (this.agenda.observacoesAgenda) {
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text(`Observacoes: ${this.agenda.observacoesAgenda}`, 14, y, { maxWidth: 180 });
      doc.setTextColor(0);
    }

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Orcamento gerado pelo sistema de orcamentos', 105, 285, { align: 'center' });

    doc.save(`orcamento-${this.clienteNome || 'cliente'}-${hoje}.pdf`);
  }

  enviarWhatsApp() {
    const cliente = this.clientes.find(c => c.id === Number(this.clienteSelecionado));
    if (!cliente?.telefone) return;
    const texto = `Olá ${cliente.nome}! Segue seu orçamento no valor de R$ ${this.total.toFixed(2)}. ${this.empresa.pix ? 'Chave Pix: ' + this.empresa.pix + '.' : ''} Qualquer dúvida estou à disposição.`;
    const numero = cliente.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(texto)}`, '_blank');
  }

  private carregarEmpresa() {
    const salvo = localStorage.getItem('empresaConfig');
    if (!salvo) return;
    try {
      this.empresa = { ...this.empresa, ...JSON.parse(salvo) };
    } catch {
      localStorage.removeItem('empresaConfig');
    }
  }
}
