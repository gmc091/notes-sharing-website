import React from "react";
import { useRouter } from "next/navigation";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MoreVertical,
  Info,
  User,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Note } from "@/types/notes";

interface NoteViewerHeaderProps {
  note: Note;
  isAuthor: boolean;
  isPurchased: boolean;
}

export function NoteViewerHeader({
  note,
  isAuthor,
  isPurchased,
}: NoteViewerHeaderProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!isAuthor) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/v1/notes/${note.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete note");
      }

      toast.success("Appunto eliminato con successo");
      router.push("/");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete note"
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <CardHeader className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-bold">{note.title}</CardTitle>
            {isPurchased && !isAuthor && (
              <Badge variant="secondary">Acquistato</Badge>
            )}
          </div>
          <div className="space-y-1">
            <CardDescription className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {note.isAnonymous
                ? "Appunto anonimo"
                : note.authorUsername || "Utente"}
            </CardDescription>
            <CardDescription className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Caricato il{" "}
              {new Date(note.createdAt).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {note.files.length} {note.files.length === 1 ? "file" : "files"}
          </Badge>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-primary/5"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => router.push(`/note/${note.id}/edit`)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Modifica</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Elimina</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Description Section */}
      {note.description && (
        <div className="pt-4">
          <Separator className="mb-4" />
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Descrizione</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {note.description}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t pt-4">
        {note.schools.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Scuole:</span>
            {note.schools.map((school) => (
              <Badge key={school} variant="outline">
                {school}
              </Badge>
            ))}
          </div>
        )}

        {note.subjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Materie:</span>
            {note.subjects.map((subject) => (
              <Badge key={subject} variant="outline">
                {subject}
              </Badge>
            ))}
          </div>
        )}

        {note.years.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Anni:</span>
            {note.years.map((year) => (
              <Badge key={year} variant="outline">
                Anno {year}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Sei sicuro di voler eliminare questo appunto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. L&apos;appunto verrà
              eliminato permanentemente e non sarà più accessibile a nessun
              utente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <span className="animate-pulse">
                    Eliminazione in corso...
                  </span>
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CardHeader>
  );
}
