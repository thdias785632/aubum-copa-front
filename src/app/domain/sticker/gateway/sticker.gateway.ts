import { Observable } from 'rxjs';
import {
  AlbumSummary,
  Sticker,
  TrocaUser,
  UserSticker,
} from '../dto/sticker.dto';

export abstract class StickerGateway {
  abstract getAllStickers(): Observable<Sticker[]>;
  abstract getAlbum(userId: string): Observable<AlbumSummary>;
  abstract increment(userId: string, stickerId: string): Observable<UserSticker>;
  abstract decrement(userId: string, stickerId: string): Observable<UserSticker>;
  abstract getRepetidas(userId: string): Observable<UserSticker[]>;
  abstract reset(userId: string): Observable<void>;
  abstract getTrocaUsers(): Observable<TrocaUser[]>;
  abstract getTrocaRepetidas(userId: string): Observable<UserSticker[]>;
}
