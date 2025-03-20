
import React, { useState } from "react";
import { NoteItem } from "@/components/NoteItem";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Note } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategorySelector } from "@/components/CategorySelector";
import { cn } from "@/lib/utils";
import { 
  Keyboard, 
  LogOut, 
  Plus, 
  Settings, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { 
  Sidebar as ShadcnSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { FeedbackDialog } from "@/components/FeedbackDialog";

interface SidebarProps {
  notes: Note[];
  activeNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: (category?: string) => void;
  onPinNote: (id: string, isPinned: boolean) => void;
  onSearch: (query: string) => void;
  searchInputRef?: (ref: HTMLInputElement | null) => void;
  categories: string[];
  onSelectCategory: (category: string) => void;
  onAddCategory: (category: string) => void;
  selectedCategory: string;
}

export function Sidebar({
  notes,
  activeNote,
  onSelectNote,
  onCreateNote,
  onPinNote,
  onSearch,
  searchInputRef,
  categories,
  onSelectCategory,
  onAddCategory,
  selectedCategory,
}: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  // Group notes by pinned status
  const pinnedNotes = notes.filter(note => note.isPinned);
  const unpinnedNotes = notes.filter(note => !note.isPinned);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handlePremiumClick = () => {
    navigate("/subscription");
  };

  const handleCreateNote = () => {
    onCreateNote(selectedCategory !== "All" ? selectedCategory : "Uncategorized");
  };
  
  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <ShadcnSidebar>
        <SidebarHeader className="py-4 px-2 border-b">
          <div className="flex items-center justify-between px-2">
            <h1 className="text-xl font-semibold">QuickNote</h1>
            <ThemeToggle />
          </div>
          <div className="mt-4">
            <UserProfile />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <div className="p-3 space-y-3">
            <SearchBar onSearch={onSearch} searchInputRef={searchInputRef} />
            
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={onSelectCategory}
              onAddCategory={onAddCategory}
            />
            
            <Button onClick={handleCreateNote} variant="default" size="sm" className="w-full" title="New Note (Ctrl+N)">
              <Plus className="h-4 w-4 mr-1" />
              New Note
            </Button>
          </div>
          
          <SidebarSeparator />
          
          <SidebarGroup>
            {pinnedNotes.length > 0 && (
              <>
                <SidebarGroupLabel className="px-4 pt-2">PINNED</SidebarGroupLabel>
                <SidebarGroupContent className="px-2">
                  <ScrollArea className="h-auto max-h-[250px]">
                    <div className="space-y-1 px-1">
                      {pinnedNotes.map(note => (
                        <NoteItem 
                          key={note.id}
                          note={note}
                          isActive={activeNote?.id === note.id}
                          onClick={() => onSelectNote(note)}
                          onPin={() => onPinNote(note.id, !note.isPinned)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </SidebarGroupContent>
              </>
            )}
          </SidebarGroup>
          
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 pt-2">
              {pinnedNotes.length > 0 ? "NOTES" : "ALL NOTES"}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <ScrollArea className="h-auto max-h-[calc(100vh-420px)]">
                <div className="space-y-1 px-1">
                  {unpinnedNotes.length > 0 ? (
                    unpinnedNotes.map(note => (
                      <NoteItem 
                        key={note.id}
                        note={note}
                        isActive={activeNote?.id === note.id}
                        onClick={() => onSelectNote(note)}
                        onPin={() => onPinNote(note.id, !note.isPinned)}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-4">
                      No notes found. Create a new one!
                    </p>
                  )}
                </div>
              </ScrollArea>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t space-y-2 p-3">
          {/* Premium Upgrade Button */}
          <div className="bg-[#2A1E12] rounded-xl p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h3 className="text-base font-semibold text-white">Upgrade to Premium</h3>
            </div>
            <p className="text-gray-400 text-xs mb-2">
              Get voice notes, more storage and remove ads
            </p>
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium"
              onClick={handlePremiumClick}
            >
              Upgrade Now
            </Button>
          </div>
          
          {/* Settings, Shortcuts, Feedback, Logout buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center justify-center gap-1 text-xs"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Settings</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShortcutsOpen(true)}
              className="flex items-center justify-center gap-1 text-xs"
            >
              <Keyboard className="h-3.5 w-3.5" />
              <span>Shortcuts</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFeedbackOpen(true)}
              className="flex items-center justify-center gap-1 text-xs"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Feedback</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 text-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </SidebarFooter>
      </ShadcnSidebar>
      
      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
      
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
      
      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
      />
    </SidebarProvider>
  );
}
