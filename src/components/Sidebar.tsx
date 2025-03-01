
import { useEffect, useState } from "react";
import { SearchBar } from "./SearchBar";
import { NoteItem } from "./NoteItem";
import { ThemeToggle } from "./ThemeToggle";
import { PremiumBanner } from "./PremiumBanner";
import { Note } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  LogOut, 
  Settings 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  notes: Note[];
  activeNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onPinNote: (id: string, isPinned: boolean) => Promise<void>;
  onSearch: (query: string) => void;
}

export function Sidebar({
  notes,
  activeNote,
  onSelectNote,
  onCreateNote,
  onPinNote,
  onSearch,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  
  // Automatically collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile]);

  return (
    <div
      className={cn(
        "bg-sidebar text-sidebar-foreground h-full flex flex-col transition-all duration-300 ease-in-out border-r",
        collapsed ? "w-[60px]" : "w-[280px]"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h1 className="text-xl font-medium slide-in">QuickNote</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-2 flex gap-2">
          {!collapsed && (
            <div className="flex-1 slide-in">
              <SearchBar onSearch={onSearch} />
            </div>
          )}
          <Button
            onClick={onCreateNote}
            size="icon"
            aria-label="Create new note"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {!collapsed && (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isActive={activeNote?.id === note.id}
                onClick={() => onSelectNote(note)}
                onPin={() => onPinNote(note.id, !note.isPinned)}
              />
            ))}
            {notes.length === 0 && (
              <div className="text-center p-4 text-muted-foreground">
                <p>No notes yet</p>
                <p className="text-sm">Create your first note!</p>
              </div>
            )}
          </div>
        )}

        {!collapsed && <PremiumBanner />}
      </div>

      <div className="p-2 flex items-center justify-between border-t">
        <ThemeToggle />
        
        {!collapsed && (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        )}
        
        {collapsed && (
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
