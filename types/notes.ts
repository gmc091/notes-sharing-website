// types/notes.ts

export interface NoteFile {
  key: string;
  name: string;
  size?: number;
  lastModified?: Date;
  url?: string;
}

export interface Note {
  id: number;
  title: string;
  files: NoteFile[];
  createdAt: string;
  schools: string[];
  subjects: string[];
  years: number[];
  viewCount: number;
  rating?: number;
  ratingCount: number;
}

export interface NotesApiResponse {
  notes: Note[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
