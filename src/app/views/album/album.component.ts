import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { LoaderComponent } from '../../components/loader/loader.component';
import { MascotComponent } from '../../components/mascot/mascot.component';
import { UserGateway } from '../../domain/user/gateway/user.gateway';
import { StickerGateway } from '../../domain/sticker/gateway/sticker.gateway';
import { UserService } from '../../infra/user/user.service';
import { StickerService } from '../../infra/sticker/sticker.service';
import { NotificationService } from '../../infra/notification/notification.service';
import {
  AlbumSection,
  AlbumSticker,
  AlbumSummary,
} from '../../domain/sticker/dto/sticker.dto';
import { User } from '../../domain/user/dto/user.dto';

@Component({
  selector: 'app-album',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, MascotComponent],
  providers: [
    { provide: UserGateway, useClass: UserService },
    { provide: StickerGateway, useClass: StickerService },
  ],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss',
  animations: [
    trigger('flash', [
      transition('* => *', [
        animate(
          '420ms ease-out',
          keyframes([
            style({ transform: 'scale(1)', offset: 0 }),
            style({ transform: 'scale(1.22) rotate(-4deg)', offset: 0.45 }),
            style({ transform: 'scale(0.95)', offset: 0.8 }),
            style({ transform: 'scale(1)', offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('progressIn', [
      transition(':enter', [
        style({ width: '0%' }),
        animate('800ms cubic-bezier(0.2, 0.8, 0.2, 1)'),
      ]),
    ]),
  ],
})
export class AlbumComponent implements OnInit {
  user: User | null = null;
  album: AlbumSummary | null = null;
  isLoading = false;
  search = '';
  mascotBubble = '';
  hideOwned = false;

  // Controla animacao individual por figurinha
  pulseMap: Record<string, number> = {};

  // Confete no topo quando marca nova
  showConfetti = false;

  // Long-press em mobile: 600ms p/ disparar decremento
  private readonly LONG_PRESS_MS = 600;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private longPressTriggered = false;

  constructor(
    private userService: UserGateway,
    private stickerService: StickerGateway,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getUser();
    if (!this.user) return;
    this.loadAlbum();
  }

  loadAlbum(showLoader = true): void {
    if (!this.user) return;
    if (showLoader) this.isLoading = true;
    this.stickerService.getAlbum(this.user.id).subscribe({
      next: (album) => {
        this.album = album;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notification.showMessage(
          err?.error?.message ?? 'Erro ao carregar album',
          'error'
        );
      },
    });
  }

  onStickerClick(sticker: AlbumSticker): void {
    if (!this.user) return;
    const prevQuantity = sticker.quantity;
    this.stickerService.increment(this.user.id, sticker.id).subscribe({
      next: () => {
        sticker.quantity += 1;
        sticker.owned = sticker.quantity > 0;
        sticker.repetidas = sticker.quantity > 1 ? sticker.quantity - 1 : 0;

        this.pulseMap[sticker.id] = (this.pulseMap[sticker.id] ?? 0) + 1;
        this.updateTotals(1, prevQuantity === 0, prevQuantity >= 1);

        if (prevQuantity === 0) {
          this.triggerConfetti();
          this.showBubble(`AU AU! ${sticker.code} colada no álbum!`);
          this.notification.showMessage(
            `Figurinha ${sticker.code} marcada no álbum!`,
            'success'
          );
        } else {
          this.showBubble(`Repetida! (${sticker.repetidas}x)`);
          this.notification.showMessage(
            `Figurinha ${sticker.code} foi pras repetidas (${sticker.repetidas}x)`,
            'info'
          );
        }
      },
      error: (err) => {
        this.notification.showMessage(
          err?.error?.message ?? 'Erro ao marcar',
          'error'
        );
      },
    });
  }

  onStickerRightClick(event: MouseEvent, sticker: AlbumSticker): void {
    event.preventDefault();
    this.decrementSticker(sticker);
  }

  onMinusClick(event: Event, sticker: AlbumSticker): void {
    event.stopPropagation();
    event.preventDefault();
    this.decrementSticker(sticker);
  }

  onStickerTouchStart(_event: TouchEvent, sticker: AlbumSticker): void {
    if (!sticker.owned) return;
    this.clearLongPressTimer();
    this.longPressTriggered = false;
    this.longPressTimer = setTimeout(() => {
      this.longPressTriggered = true;
      this.decrementSticker(sticker);
    }, this.LONG_PRESS_MS);
  }

  onStickerTouchEnd(event: TouchEvent, _sticker: AlbumSticker): void {
    this.clearLongPressTimer();
    // Se o long-press ja disparou, impede o click sintetico (que viria a
    // seguir) de registrar um incremento.
    if (this.longPressTriggered) {
      event.preventDefault();
    }
  }

  onStickerTouchCancel(): void {
    this.clearLongPressTimer();
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  decrementSticker(sticker: AlbumSticker): void {
    if (!this.user || sticker.quantity === 0) return;
    const prevQuantity = sticker.quantity;
    this.stickerService.decrement(this.user.id, sticker.id).subscribe({
      next: () => {
        sticker.quantity = Math.max(sticker.quantity - 1, 0);
        sticker.owned = sticker.quantity > 0;
        sticker.repetidas = sticker.quantity > 1 ? sticker.quantity - 1 : 0;

        this.pulseMap[sticker.id] = (this.pulseMap[sticker.id] ?? 0) + 1;
        this.updateTotals(-1, sticker.quantity === 0, prevQuantity > 1);

        this.notification.showMessage(
          `Figurinha ${sticker.code} reduzida`,
          'warning'
        );
      },
      error: (err) => {
        this.notification.showMessage(
          err?.error?.message ?? 'Erro ao reduzir',
          'error'
        );
      },
    });
  }

  private updateTotals(
    delta: number,
    ownedChanged: boolean,
    wasRepetida: boolean
  ): void {
    if (!this.album) return;
    if (ownedChanged) {
      if (delta > 0) this.album.ownedStickers += 1;
      else this.album.ownedStickers -= 1;
    }
    if (delta > 0) {
      // sum of repetidas increases if previous owned >= 1
      if (!ownedChanged) this.album.repetidasTotal += 1;
    } else {
      if (wasRepetida) this.album.repetidasTotal -= 1;
    }
    if (this.album.totalStickers > 0) {
      this.album.progressPercent =
        Math.round(
          (this.album.ownedStickers / this.album.totalStickers) * 1000
        ) / 10;
    }
  }

  showBubble(text: string): void {
    this.mascotBubble = text;
    setTimeout(() => (this.mascotBubble = ''), 2400);
  }

  triggerConfetti(): void {
    this.showConfetti = true;
    setTimeout(() => (this.showConfetti = false), 1600);
  }

  filteredSections(): AlbumSection[] {
    if (!this.album) return [];
    const q = this.search.trim().toLowerCase();
    return this.album.sections
      .map((section) => {
        let stickers = section.stickers;
        if (q) {
          stickers = stickers.filter(
            (s) =>
              s.code.toLowerCase().includes(q) ||
              (s.playerName ?? '').toLowerCase().includes(q) ||
              (s.team ?? '').toLowerCase().includes(q) ||
              section.section.toLowerCase().includes(q)
          );
        }
        if (this.hideOwned) {
          stickers = stickers.filter((s) => !s.owned);
        }
        return { ...section, stickers };
      })
      .filter((section) => section.stickers.length > 0);
  }

  trackBySection(_: number, section: AlbumSection): string {
    return section.section;
  }

  trackBySticker(_: number, sticker: AlbumSticker): string {
    return sticker.id;
  }
}
