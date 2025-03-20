
import { formatDistanceToNow } from "date-fns";
import { Note } from "@/hooks/useNotes";
import { Pin, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onClick: () => void;
  onPin: () => void;
}

export function NoteItem({ note, isActive, onClick, onPin }: NoteItemProps) {
  // Extract a preview from content (strip HTML tags)
  const getPreview = (content: string) => {
    // Remove HTML tags
    const plainText = content.replace(/<[^>]*>/g, "");
    // Return truncated text
    return plainText.length > 100 
      ? plainText.substring(0, 100) + "..." 
      : plainText;
  };

  const timeAgo = note.updatedAt 
    ? formatDistanceToNow(note.updatedAt.toDate(), { addSuffix: true })
    : "";

  return (
    <div
      className={cn(
        "p-4 cursor-pointer rounded-lg mb-2 group transition-all duration-300 overflow-hidden",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium truncate mb-1">{note.title || "Untitled"}</h3>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-accent",
            note.isPinned && "opacity-100"
          )}
          aria-label={note.isPinned ? "Unpin note" : "Pin note"}
        >
          <Pin 
            className={cn(
              "h-4 w-4", 
              note.isPinned && "fill-current"
            )} 
          />
        </button>
      </div>
      
      <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
        {getPreview(note.content)}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {timeAgo}
        </div>
        
        {note.category && (
          <Badge variant="outline" className="text-xs">
            <Tag className="h-3 w-3 mr-1" />
            {note.category}
          </Badge>
        )}
      </div>
    </div>
  );
}
