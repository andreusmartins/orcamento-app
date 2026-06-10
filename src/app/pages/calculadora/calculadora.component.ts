import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type Operacao = '+' | '-' | '*' | '/';

interface HistoricoCalculo {
  expressao: string;
  resultado: string;
}

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calculadora.component.html'
})
export class CalculadoraComponent {
  visor = '0';
  valorAnterior: number | null = null;
  operacao: Operacao | null = null;
  aguardandoNovoValor = false;
  expressaoAtual = '';
  copiado = false;
  historico: HistoricoCalculo[] = [];

  readonly botoes = [
    ['C', '+/-', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  pressionar(valor: string) {
    if (this.ehNumero(valor)) {
      this.inserirNumero(valor);
      return;
    }

    if (valor === '.') {
      this.inserirDecimal();
      return;
    }

    if (valor === 'C') {
      this.limpar();
      return;
    }

    if (valor === '+/-') {
      this.inverterSinal();
      return;
    }

    if (valor === '%') {
      this.aplicarPorcentagem();
      return;
    }

    if (valor === '=') {
      this.calcular();
      return;
    }

    this.definirOperacao(valor as Operacao);
  }

  copiarResultado() {
    navigator.clipboard?.writeText(this.visor);
    this.copiado = true;
    setTimeout(() => this.copiado = false, 1600);
  }

  usarResultadoNoVisor(resultado: string) {
    this.visor = resultado;
    this.valorAnterior = null;
    this.operacao = null;
    this.expressaoAtual = '';
    this.aguardandoNovoValor = true;
  }

  limparHistorico() {
    this.historico = [];
  }

  private inserirNumero(numero: string) {
    if (this.visor === '0' || this.aguardandoNovoValor) {
      this.visor = numero;
      this.aguardandoNovoValor = false;
      return;
    }

    if (this.visor.replace('.', '').replace('-', '').length >= 12) return;
    this.visor += numero;
  }

  private inserirDecimal() {
    if (this.aguardandoNovoValor) {
      this.visor = '0.';
      this.aguardandoNovoValor = false;
      return;
    }

    if (!this.visor.includes('.')) {
      this.visor += '.';
    }
  }

  private definirOperacao(operacao: Operacao) {
    const valorAtual = this.valorNumerico;

    if (this.valorAnterior !== null && this.operacao && !this.aguardandoNovoValor) {
      this.calcular(false);
      this.valorAnterior = this.valorNumerico;
    } else {
      this.valorAnterior = valorAtual;
    }

    this.operacao = operacao;
    this.expressaoAtual = `${this.formatarNumero(this.valorAnterior)} ${this.simboloOperacao(operacao)}`;
    this.aguardandoNovoValor = true;
  }

  private calcular(registrarHistorico = true) {
    if (this.valorAnterior === null || !this.operacao) return;

    const primeiroValor = this.valorAnterior;
    const segundoValor = this.valorNumerico;
    const resultado = this.executarOperacao(primeiroValor, segundoValor, this.operacao);

    if (!Number.isFinite(resultado)) {
      this.visor = 'Erro';
      this.valorAnterior = null;
      this.operacao = null;
      this.expressaoAtual = '';
      this.aguardandoNovoValor = true;
      setTimeout(() => { if (this.visor === 'Erro') this.limpar(); }, 1500);
      return;
    }

    const expressao = `${this.formatarNumero(primeiroValor)} ${this.simboloOperacao(this.operacao)} ${this.formatarNumero(segundoValor)}`;
    this.visor = this.formatarNumero(resultado);

    if (registrarHistorico) {
      this.historico = [
        { expressao, resultado: this.visor },
        ...this.historico
      ].slice(0, 8);
    }

    this.valorAnterior = null;
    this.operacao = null;
    this.expressaoAtual = '';
    this.aguardandoNovoValor = true;
  }

  private aplicarPorcentagem() {
    this.visor = this.formatarNumero(this.valorNumerico / 100);
  }

  private inverterSinal() {
    if (this.visor === '0') return;
    this.visor = this.visor.startsWith('-') ? this.visor.slice(1) : `-${this.visor}`;
  }

  private limpar() {
    this.visor = '0';
    this.valorAnterior = null;
    this.operacao = null;
    this.expressaoAtual = '';
    this.aguardandoNovoValor = false;
  }

  private executarOperacao(a: number, b: number, operacao: Operacao): number {
    switch (operacao) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b === 0 ? Number.NaN : a / b;
    }
  }

  private get valorNumerico(): number {
    if (this.visor === 'Erro') return 0;
    const valor = Number(this.visor.replace(',', '.'));
    return Number.isFinite(valor) ? valor : 0;
  }

  private ehNumero(valor: string): boolean {
    return /^\d$/.test(valor);
  }

  private simboloOperacao(operacao: Operacao): string {
    return operacao === '*' ? 'x' : operacao;
  }

  private formatarNumero(valor: number): string {
    const arredondado = Number.parseFloat(valor.toFixed(10));
    return arredondado.toString();
  }
}
