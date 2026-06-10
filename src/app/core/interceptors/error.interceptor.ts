import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        // Rede offline ou backend fora do ar
        console.error('Servidor indisponível. Verifique sua conexão.');
      }
      return throwError(() => error);
    })
  );
};
