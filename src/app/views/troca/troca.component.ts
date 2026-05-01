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
import { TrocaUser, UserSticker } from '../../domain/sticker/dto/sticker.dto';
import { User } from '../../domain/user/dto/user.dto';

@Component({
  selector: 'app-troca',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, MascotComponent],
  providers: [
    { provide: UserGateway, useClass: UserService },
    { provide: StickerGateway, useClass: StickerService },
  ],
  templateUrl: './troca.component.html',
  styleUrl: './troca.component.scss',
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
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('250ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class TrocaComponent implements OnInit {
  user: User | null = null;
  trocaUsers: TrocaUser[] = [];
  selectedUser: TrocaUser | null = null;
  selectedRepetidas: UserSticker[] = [];
  myStickers = new Set<string>();
  isLoading = false;
  isLoadingRepetidas = false;
  filterNaoTenho = false;
  copied = false;

  constructor(
    private userService: UserGateway,
    private stickerService: StickerGateway,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getUser();
    if (!this.user) return;
    this.loadUsers();
    this.loadMyStickers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.stickerService.getTrocaUsers().subscribe({
      next: (data) => {
        this.trocaUsers = this.user
          ? data.filter((u) => u.userId !== this.user!.id)
          : data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.notification.showMessage(
          err?.error?.message ?? 'Erro ao carregar usuários',
          'error'
        );
      },
    });
  }

  loadMyStickers(): void {
    if (!this.user) return;
    this.stickerService.getAlbum(this.user.id).subscribe({
      next: (album) => {
        this.myStickers.clear();
        for (const section of album.sections) {
          for (const sticker of section.stickers) {
            if (sticker.owned) {
              this.myStickers.add(sticker.id);
            }
          }
        }
      },
    });
  }

  selectUser(trocaUser: TrocaUser): void {
    this.selectedUser = trocaUser;
    this.filterNaoTenho = false;
    this.copied = false;
    this.isLoadingRepetidas = true;
    this.stickerService.getTrocaRepetidas(trocaUser.userId).subscribe({
      next: (data) => {
        this.selectedRepetidas = data;
        this.isLoadingRepetidas = false;
      },
      error: (err) => {
        this.isLoadingRepetidas = false;
        this.notification.showMessage(
          err?.error?.message ?? 'Erro ao carregar repetidas',
          'error'
        );
      },
    });
  }

  backToList(): void {
    this.selectedUser = null;
    this.selectedRepetidas = [];
    this.filterNaoTenho = false;
    this.copied = false;
  }

  filteredRepetidas(): UserSticker[] {
    if (!this.filterNaoTenho) return this.selectedRepetidas;
    return this.selectedRepetidas.filter(
      (r) => !this.myStickers.has(r.stickerId)
    );
  }

  copyList(): void {
    const items = this.filteredRepetidas();
    if (items.length === 0) {
      this.notification.showMessage('Lista vazia, nada para copiar', 'error');
      return;
    }

    const header = this.filterNaoTenho
      ? `Figurinhas que EU NÃO TENHO das repetidas de ${this.selectedUser?.userName}:`
      : `Repetidas de ${this.selectedUser?.userName}:`;

    const lines = items.map(
      (r) =>
        `${r.code} - ${r.team ?? ''} ${r.playerName ?? ''} (x${r.quantity - 1})`.trim()
    );

    const text = `${header}\n${lines.join('\n')}\n\nTotal: ${items.length} figurinhas`;

    this.copyToClipboard(text);
  }

  private copyToClipboard(text: string): void {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => this.onCopySuccess(),
        () => this.fallbackCopy(text)
      );
    } else {
      this.fallbackCopy(text);
    }
  }

  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      this.onCopySuccess();
    } catch {
      this.notification.showMessage('Erro ao copiar', 'error');
    }
    document.body.removeChild(textarea);
  }

  private onCopySuccess(): void {
    this.copied = true;
    this.notification.showMessage('Lista copiada!', 'success');
    setTimeout(() => (this.copied = false), 3000);
  }

  trackByUser(_: number, item: TrocaUser): string {
    return item.userId;
  }

  trackBySticker(_: number, item: UserSticker): string {
    return item.stickerId;
  }
}
