import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import {
  NotificationMessage,
  NotificationService,
} from '../../infra/notification/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(110%)', opacity: 0 }),
        animate(
          '260ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '220ms ease-in',
          style({ transform: 'translateX(110%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class NotificationComponent {
  messages: NotificationMessage[] = [];

  constructor(private notificationService: NotificationService) {
    this.notificationService.messages$.subscribe((msgs) => {
      this.messages = msgs;
    });
  }

  dismiss(id: number): void {
    this.notificationService.dismiss(id);
  }

  icon(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }
}
