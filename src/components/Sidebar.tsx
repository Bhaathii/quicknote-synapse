
import React, { useState } from "react";
import { NoteItem } from "@/components/NoteItem";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Note } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Keyboard, Plus, Settings } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";

interface SidebarProps {
  notes: Note[];
  activeNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onPinNote: (id: string, isPinned: boolean) => void;
  onSearch: (query: string) => void;
  searchInputRef?: (ref: HTMLInputElement | null) => void;
}

export function Sidebar({
  notes,
  activeNote,
  onSelectNote,
  onCreateNote,
  onPinNote,
  onSearch,
  searchInputRef,
}: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const isMobile = useMobile();
  
  // Group notes by pinned status
  const pinnedNotes = notes.filter(note => note.isPinned);
  const unpinnedNotes = notes.filter(note => !note.isPinned);
  
  return (
    <div className={cn(
      "border-r bg-card w-72 flex flex-col",
      isMobile && "absolute z-10 h-full"
    )}>
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold mb-4">QuickNote</h1>
        <SearchBar onSearch={onSearch} searchInputRef={searchInputRef} />
      </div>
      
      <div className="flex items-center justify-between p-4 border-b">
        <Button onClick={onCreateNote} variant="default" size="sm" className="w-full" title="New Note (Ctrl+N)">
          <Plus className="h-4 w-4 mr-1" />
          New Note
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {pinnedNotes.length > 0 && (
          <div className="p-2">
            <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2">PINNED</h2>
            <div className="space-y-1">
              {pinnedNotes.map(note => (
                <NoteItem 
                  key={note.id}
                  note={note}
                  isActive={activeNote?.id === note.id}
                  onClick={() => onSelectNote(note)}
                  onTogglePin={(id) => onPinNote(id, !note.isPinned)}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="p-2">
          {pinnedNotes.length > 0 && (
            <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2">NOTES</h2>
          )}
          <div className="space-y-1">
            {unpinnedNotes.length > 0 ? (
              unpinnedNotes.map(note => (
                <NoteItem 
                  key={note.id}
                  note={note}
                  isActive={activeNote?.id === note.id}
                  onClick={() => onSelectNote(note)}
                  onTogglePin={(id) => onPinNote(id, !note.isPinned)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground p-2">
                No notes found. Create a new one!
              </p>
            )}
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShortcutsOpen(true)}
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
        </div>
        <ThemeToggle />
      </div>
      
      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
      
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </div>
  );
}
