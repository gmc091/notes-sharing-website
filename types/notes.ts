/**
 * Represents a file within a note
 */
export interface NoteFile {
  key: string;
  name: string;
  size?: number;
  lastModified?: Date;
  url?: string;
}

/**
 * Represents a note with its associated files and metadata
 */
export interface Note {
  id: number;
  title: string;
  files: NoteFile[];
  createdAt: string;
}

/**
 * Response structure from the notes API
 */
export interface NotesApiResponse {
  notes: Note[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
