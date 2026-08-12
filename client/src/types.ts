export interface User {
  id: number;
  email: string;
}

export interface Board {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
}

export type ItemType = "link" | "image";

export interface BoardItem {
  id: number;
  board_id: number;
  type: ItemType;
  url: string;
  title: string | null;
  thumbnail_url: string | null;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  created_at: string;
}

export interface NewBoardItem {
  type: ItemType;
  url: string;
  title?: string;
  thumbnail_url?: string;
  pos_x?: number;
  pos_y?: number;
}
