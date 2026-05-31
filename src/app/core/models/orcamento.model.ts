import { Cliente } from './cliente.model';

export type StatusOrcamento = 'pendente' | 'aprovado' | 'recusado' | 'executado';

export interface ItemOrcamento {
  id?: number;
  descricao: string;
  valor: number;
  observacao?: string;
}

export interface Orcamento {
  id?: number;
  clienteId: number;
  cliente?: Cliente;
  clienteNome?: string;
  itens: ItemOrcamento[];
  total?: number;
  status?: StatusOrcamento;
  tipoServico?: string;
  dataVisita?: string;
  dataServico?: string;
  dataRetorno?: string;
  observacoesAgenda?: string;
  ordemServico?: boolean;
  createdAt?: string;
}
