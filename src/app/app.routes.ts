import { Routes } from '@angular/router';
import { NovoOrcamentoComponent } from './pages/novo-orcamento/novo-orcamento.component';
import { ClientesComponent } from './pages/novo-orcamento/clientes/clientes.component';
import { RecebimentosComponent } from './pages/novo-orcamento/recebimentos/recebimentos.component';
import { WhatsappComponent } from './pages/novo-orcamento/whatsapp/whatsapp.component';
import { CalculadoraComponent } from './pages/calculadora/calculadora.component';
import { ServicosComponent } from './pages/servicos/servicos.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { SuperAdminComponent } from './pages/super-admin/super-admin.component';
import { authGuard, adminGuard, superAdminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'super-admin', component: SuperAdminComponent, canActivate: [superAdminGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard] },
  { path: 'novo-orcamento', component: NovoOrcamentoComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [authGuard] },
  { path: 'recebimentos', component: RecebimentosComponent, canActivate: [authGuard] },
  { path: 'whatsapp', component: WhatsappComponent, canActivate: [authGuard] },
  { path: 'calculadora', component: CalculadoraComponent, canActivate: [authGuard] },
  { path: 'servicos', component: ServicosComponent, canActivate: [authGuard] }
];
