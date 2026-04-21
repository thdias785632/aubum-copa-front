import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

interface LoadingState {
  count: number;
  message: string;
}

const DEFAULT_MESSAGE = 'Au au! Só um segundo...';

/**
 * Serviço global de loader. Conta chamadas concorrentes (várias requests em
 * paralelo mantêm o overlay ativo até a última terminar) e expõe uma mensagem
 * contextual.
 *
 * Usado primariamente pelo `loadingInterceptor` — cada request HTTP abre e
 * fecha o loader automaticamente. Componentes podem chamar show()/hide()
 * diretamente para tarefas não-HTTP (ex: animações de transição).
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private state$ = new BehaviorSubject<LoadingState>({
    count: 0,
    message: DEFAULT_MESSAGE,
  });

  readonly isLoading$: Observable<boolean> = this.state$.pipe(
    map((s) => s.count > 0),
  );

  readonly message$: Observable<string> = this.state$.pipe(map((s) => s.message));

  show(message = DEFAULT_MESSAGE): void {
    const current = this.state$.value;
    this.state$.next({ count: current.count + 1, message });
  }

  hide(): void {
    const current = this.state$.value;
    const nextCount = Math.max(0, current.count - 1);
    this.state$.next({
      count: nextCount,
      message: nextCount === 0 ? DEFAULT_MESSAGE : current.message,
    });
  }

  reset(): void {
    this.state$.next({ count: 0, message: DEFAULT_MESSAGE });
  }
}
