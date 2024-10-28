// types/notes.ts
export interface NoteFile {
  key: string;
  name: string;
  size?: number;
  lastModified?: Date;
  url?: string;
}

export interface ViewerFile {
  key: string;
  url: string;
  size?: number;
}

export interface Note {
  id: number;
  title: string;
  files: NoteFile[];
  createdAt: string;
  schools: string[];
  subjects: string[];
  years: number[];
  purchaseCount: number;
  isAuthor?: boolean;
  isPurchased?: boolean;
}

export interface NotesApiResponse {
  notes: Note[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface LibraryNote extends Note {
  purchasedAt: string;
}

export const toViewerFile = (file: NoteFile): ViewerFile | null => {
  if (!file.url) return null;
  return {
    key: file.key,
    url: file.url,
    size: file.size,
  };
};
