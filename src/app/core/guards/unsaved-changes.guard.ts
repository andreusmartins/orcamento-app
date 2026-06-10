import { CanDeactivateFn } from '@angular/router';

export interface PodeDesativar {
  temAlteracoesNaoSalvas(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<PodeDesativar> = (component) => {
  if (component.temAlteracoesNaoSalvas()) {
    return confirm('Você tem um orçamento preenchido que ainda não foi salvo. Deseja sair mesmo assim?');
  }
  return true;
};
