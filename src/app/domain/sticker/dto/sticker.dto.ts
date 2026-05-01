export interface Sticker {
  id: string;
  code: string;
  section: string;
  team?: string | null;
  playerName?: string | null;
  position: number;
  isSpecial: boolean;
}

export interface AlbumSticker {
  id: string;
  code: string;
  team?: string | null;
  playerName?: string | null;
  position: number;
  isSpecial: boolean;
  quantity: number;
  repetidas: number;
  owned: boolean;
}

export interface AlbumSection {
  section: string;
  totalStickers: number;
  ownedStickers: number;
  stickers: AlbumSticker[];
}

export interface AlbumSummary {
  userId: string;
  totalStickers: number;
  ownedStickers: number;
  repetidasTotal: number;
  progressPercent: number;
  sections: AlbumSection[];
}

export interface UserSticker {
  id: string;
  userId: string;
  stickerId: string;
  quantity: number;
  code: string;
  section: string;
  team?: string | null;
  playerName?: string | null;
  position: number;
  isSpecial: boolean;
}

export interface TrocaUser {
  userId: string;
  userName: string;
  repetidasCount: number;
}
