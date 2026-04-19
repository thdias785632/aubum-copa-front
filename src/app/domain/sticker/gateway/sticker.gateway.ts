import { Observable } from 'rxjs';
import {
  AlbumSummary,
  Sticker,
  UserSticker,
} from '../dto/sticker.dto';

export abstract class StickerGateway {
  abstract getAllStickers(): Observable<Sticker[]>;
  abstract getAlbum(userId: string): Observable<AlbumSummary>;
  abstract increment(userId: string, stickerId: string): Observable<UserSticker>;
  abstract decrement(userId: string, stickerId: string): Observable<UserSticker>;
  abstract getRepetidas(userId: string): Observable<UserSticker[]>;
  abstract reset(userId: string): Observable<void>;
}
