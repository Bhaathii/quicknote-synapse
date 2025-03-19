
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
      
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 my-2">
          {note.tags.slice(0, 3).map(tag => (
            <Badge 
              key={tag} 
              variant="outline" 
              className="text-xs py-0 px-1.5 h-5"
            >
              <Tag className="h-2.5 w-2.5 mr-1" />
              {tag}
            </Badge>
          ))}
          {note.tags.length > 3 && (
            <Badge 
              variant="outline" 
              className="text-xs py-0 px-1.5 h-5"
            >
              +{note.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
      
      <div className="text-xs text-muted-foreground mt-2">
        {timeAgo}
      </div>
    </div>
  );
}
