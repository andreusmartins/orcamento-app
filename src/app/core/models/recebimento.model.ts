import { Orcamento } from './orcamento.model';

export type StatusRecebimento = 'pago' | 'pendente' | 'parcial' | 'vencido';

export interface Recebimento {
  id?: number;
  orcamento?: Orcamento;
  valor: number;
  status: StatusRecebimento;
  formaPagamento?: string;
  pix?: string;
  dataVencimento?: string;
  observacao?: string;
  createdAt?: string;
}
