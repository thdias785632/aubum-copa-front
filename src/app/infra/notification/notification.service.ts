import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationMessage {
  id: number;
  message: string;
  type: NotificationType;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private messagesSubject = new BehaviorSubject<NotificationMessage[]>([]);
  messages$: Observable<NotificationMessage[]> =
    this.messagesSubject.asObservable();

  private counter = 0;

  showMessage(
    message: string,
    type: NotificationType = 'info',
    durationMs = 3500
  ): void {
    const id = ++this.counter;
    const current = this.messagesSubject.value;
    const next: NotificationMessage = { id, message, type };
    this.messagesSubject.next([...current, next]);

    setTimeout(() => this.dismiss(id), durationMs);
  }

  dismiss(id: number): void {
    const current = this.messagesSubject.value;
    this.messagesSubject.next(current.filter((m) => m.id !== id));
  }
}
