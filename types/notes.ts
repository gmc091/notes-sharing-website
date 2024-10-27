// types/notes.ts
export interface NoteFile {
  key: string;
  name: string;
  size?: number;
  lastModified?: Date;
  url?: string;
}

// Renamed from File to ViewerFile to avoid conflicts
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
  viewCount: number;
  rating?: number;
  ratingCount: number;
  hasViewed?: boolean;
  isAuthor?: boolean;
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

// Updated utility functions
export function toViewerFile(noteFile: NoteFile): ViewerFile {
  if (!noteFile.url) {
    throw new Error("NoteFile must have a URL to be converted to ViewerFile");
  }

  return {
    key: noteFile.key,
    url: noteFile.url,
    size: noteFile.size,
  };
}
