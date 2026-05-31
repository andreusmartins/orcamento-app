import { Routes } from '@angular/router';
import { NovoOrcamentoComponent } from './pages/novo-orcamento/novo-orcamento.component';
import { ClientesComponent } from './pages/novo-orcamento/clientes/clientes.component';
import { RecebimentosComponent } from './pages/novo-orcamento/recebimentos/recebimentos.component';
import { WhatsappComponent } from './pages/novo-orcamento/whatsapp/whatsapp.component';
import { CalculadoraComponent } from './pages/calculadora/calculadora.component';
import { ServicosComponent } from './pages/servicos/servicos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'novo-orcamento', pathMatch: 'full' },
  { path: 'novo-orcamento', component: NovoOrcamentoComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'recebimentos', component: RecebimentosComponent },
  { path: 'whatsapp', component: WhatsappComponent },
  { path: 'calculadora', component: CalculadoraComponent },
  { path: 'servicos', component: ServicosComponent }
];
