import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { LoaderComponent } from '../../components/loader/loader.component';
import { MascotComponent } from '../../components/mascot/mascot.component';
import { UserGateway } from '../../domain/user/gateway/user.gateway';
import { StickerGateway } from '../../domain/sticker/gateway/sticker.gateway';
import { UserService } from '../../infra/user/user.service';
import { StickerService } from '../../infra/sticker/sticker.service';
import { NotificationService } from '../../infra/notification/notification.service';
import { AlbumSummary } from '../../domain/sticker/dto/sticker.dto';
import { User } from '../../domain/user/dto/user.dto';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, LoaderComponent, MascotComponent],
  providers: [
    { provide: UserGateway, useClass: UserService },
    { provide: StickerGateway, useClass: StickerService },
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  album: AlbumSummary | null = null;
  isLoading = false;
  confirmingReset = false;

  constructor(
    private userService: UserGateway,
    private stickerService: StickerGateway,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getUser();
    if (!this.user) return;
    this.isLoading = true;
    this.stickerService.getAlbum(this.user.id).subscribe({
      next: (album) => {
        this.album = album;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  confirmReset(): void {
    this.confirmingReset = true;
  }

  cancelReset(): void {
    this.confirmingReset = false;
  }

  resetAlbum(): void {
    if (!this.user) return;
    this.isLoading = true;
    this.stickerService.reset(this.user.id).subscribe({
      next: () => {
        this.confirmingReset = false;
        this.isLoading = false;
        this.notification.showMessage(
          'Álbum zerado! Vamos começar de novo 🐕',
          'success'
        );
        this.router.navigate(['/album']);
      },
      error: (err) => {
        this.isLoading = false;
        this.notification.showMessage(
          err?.error?.message ?? 'Erro ao resetar',
          'error'
        );
      },
    });
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['']);
  }
}
