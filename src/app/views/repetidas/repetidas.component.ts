import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

import { LoaderComponent } from '../../components/loader/loader.component';
import { MascotComponent } from '../../components/mascot/mascot.component';
import { UserGateway } from '../../domain/user/gateway/user.gateway';
import { StickerGateway } from '../../domain/sticker/gateway/sticker.gateway';
import { UserService } from '../../infra/user/user.service';
import { StickerService } from '../../infra/sticker/sticker.service';
import { NotificationService } from '../../infra/notification/notification.service';
import { UserSticker } from '../../domain/sticker/dto/sticker.dto';
import { User } from '../../domain/user/dto/user.dto';

@Component({
  selector: 'app-repetidas',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, MascotComponent],
  providers: [
    { provide: UserGateway, useClass: UserService },
    { provide: StickerGateway, useClass: StickerService },
  ],
  templateUrl: './repetidas.component.html',
  styleUrl: './repetidas.component.scss',
  animations: [
    trigger('listIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(14px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' })),
      ]),
    ]),
  ],
})
export class RepetidasComponent implements OnInit {
  user: User | null = null;
  repetidas: UserSticker[] = [];
  search = '';
  isLoading = false;

  constructor(
    private userService: UserGateway,
    private stickerService: StickerGateway,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getUser();
    if (!this.user) return;
    this.load();
  }

  load(): void {
    if (!this.user) return;
    this.isLoading = true;
    this.stickerService.getRepetidas(this.user.id).subscribe({
      next: (data) => {
        this.repetidas = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notification.showMessage(
          err?.error?.message ?? 'Erro ao carregar repetidas',
          'error'
        );
      },
    });
  }

  removeOne(item: UserSticker): void {
    if (!this.user) return;
    this.stickerService
      .decrement(this.user.id, item.stickerId)
      .subscribe({
        next: (updated) => {
          if (updated.quantity <= 1) {
            this.repetidas = this.repetidas.filter(
              (r) => r.stickerId !== item.stickerId
            );
          } else {
            item.quantity = updated.quantity;
          }
          this.notification.showMessage(
            `Figurinha ${item.code}: removida 1 repetida`,
            'success'
          );
        },
        error: (err) => {
          this.notification.showMessage(
            err?.error?.message ?? 'Erro ao remover',
            'error'
          );
        },
      });
  }

  filtered(): UserSticker[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.repetidas;
    return this.repetidas.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        (r.playerName ?? '').toLowerCase().includes(q) ||
        (r.team ?? '').toLowerCase().includes(q) ||
        r.section.toLowerCase().includes(q)
    );
  }

  totalRepetidas(): number {
    return this.repetidas.reduce((acc, r) => acc + (r.quantity - 1), 0);
  }

  trackBy(_: number, item: UserSticker): string {
    return item.stickerId;
  }
}
