// components/note-form.tsx
import UploadForm from "@/components/upload-form";
import type { Note } from "@/types/notes";

interface NoteFormProps {
  mode: "create" | "edit";
  note?: Note;
}

export function NoteForm({ mode, note }: NoteFormProps) {
  return (
    <UploadForm
      mode={mode}
      initialData={note}
      submitButtonText={
        mode === "create" ? "Carica appunti" : "Salva modifiche"
      }
      loadingText={
        mode === "create"
          ? "Caricamento in corso..."
          : "Salvataggio in corso..."
      }
    />
  );
}
