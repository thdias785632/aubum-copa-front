import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { StickerGateway } from '../../domain/sticker/gateway/sticker.gateway';
import {
  AlbumSummary,
  Sticker,
  UserSticker,
} from '../../domain/sticker/dto/sticker.dto';

@Injectable({ providedIn: 'root' })
export class StickerService implements StickerGateway {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllStickers(): Observable<Sticker[]> {
    return this.http.get<Sticker[]>(`${this.apiUrl}/aubum/stickers`);
  }

  getAlbum(userId: string): Observable<AlbumSummary> {
    return this.http.get<AlbumSummary>(
      `${this.apiUrl}/aubum/album/${userId}`
    );
  }

  increment(userId: string, stickerId: string): Observable<UserSticker> {
    return this.http.post<UserSticker>(`${this.apiUrl}/aubum/increment`, {
      userId,
      stickerId,
    });
  }

  decrement(userId: string, stickerId: string): Observable<UserSticker> {
    return this.http.post<UserSticker>(`${this.apiUrl}/aubum/decrement`, {
      userId,
      stickerId,
    });
  }

  getRepetidas(userId: string): Observable<UserSticker[]> {
    return this.http.get<UserSticker[]>(
      `${this.apiUrl}/aubum/repetidas/${userId}`
    );
  }

  reset(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/aubum/reset/${userId}`);
  }
}
