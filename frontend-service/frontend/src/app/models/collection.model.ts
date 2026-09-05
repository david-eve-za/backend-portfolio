export interface AuthResponse {
  token: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  publisher?: string;
  publicationDate?: string;
  language?: string;
  totalVolumes?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  coverImageUrl?: string;
}

export interface Volume {
  id: string;
  volumeNumber: number;
  title?: string;
  isbn?: string;
  publisher?: string;
  publicationDate?: string;
  pageCount?: number;
  language?: string;
  coverImageUrl?: string;
  active?: boolean;
}