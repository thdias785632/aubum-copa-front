import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from './loading.service';

export const SKIP_LOADER_HEADER = 'X-Skip-Loader';

function messageFor(req: HttpRequest<unknown>): string {
  const url = req.url.toLowerCase();

  if (url.includes('/aubum/increment')) return 'Colando a figurinha...';
  if (url.includes('/aubum/decrement')) return 'Ajustando as repetidas...';
  if (url.includes('/aubum/reset')) return 'Zerando o álbum...';
  if (url.includes('/aubum/album')) return 'Montando seu álbum...';
  if (url.includes('/aubum/repetidas')) return 'Contando as repetidas...';
  if (url.includes('/aubum/stickers')) return 'Carregando catálogo...';
  if (url.includes('/user/login')) return 'Entrando...';
  if (url.includes('/user/create')) return 'Criando sua conta...';

  return 'Au au! Só um segundo...';
}

/**
 * Interceptor que mostra o loader global enquanto houver requests em andamento.
 * Pule o loader em requests específicas incluindo o header `X-Skip-Loader: 1`.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  if (req.headers.has(SKIP_LOADER_HEADER)) {
    const cleaned = req.clone({ headers: req.headers.delete(SKIP_LOADER_HEADER) });
    return next(cleaned);
  }

  loading.show(messageFor(req));
  return next(req).pipe(finalize(() => loading.hide()));
};
