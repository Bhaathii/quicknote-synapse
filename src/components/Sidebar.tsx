
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
import { Keyboard, LogOut, Plus, Settings, Sparkles, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";

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
  const [collapsed, setCollapsed] = useState(false);
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
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <div className={cn(
      "border-r bg-card transition-all duration-300 flex flex-col relative h-full",
      collapsed ? "w-[100px]" : "w-[450px]",
      isMobile && "absolute z-10 h-full"
    )}>
      <div className="p-4 border-b flex items-center justify-between">
        {!collapsed && <h1 className="text-xl font-semibold">QuickNote</h1>}
        <div className="flex items-center gap-2">
          {!collapsed && <ThemeToggle />}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {!collapsed && (
        <div className="p-4 border-b">
          <UserProfile />
        </div>
      )}
      
      <div className={cn("p-4 border-b", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <SearchBar onSearch={onSearch} searchInputRef={searchInputRef} />
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Tag className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!collapsed && (
        <div className="p-4 border-b">
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
            onAddCategory={onAddCategory}
            className="mb-2"
          />
        </div>
      )}
      
      <div className={cn(
        "flex items-center justify-center p-4 border-b",
        collapsed && "flex-col"
      )}>
        <Button 
          onClick={handleCreateNote} 
          variant="default" 
          size={collapsed ? "icon" : "sm"} 
          className={cn("", collapsed ? "w-8 h-8" : "w-full")} 
          title="New Note (Ctrl+N)"
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span className="ml-1">New Note</span>}
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {pinnedNotes.length > 0 && !collapsed && (
          <div className="p-2">
            <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2">PINNED</h2>
            <div className="space-y-1">
              {pinnedNotes.map(note => (
                <NoteItem 
                  key={note.id}
                  note={note}
                  isActive={activeNote?.id === note.id}
                  onClick={() => onSelectNote(note)}
                  onPin={() => onPinNote(note.id, !note.isPinned)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        )}
        
        <div className="p-2">
          {pinnedNotes.length > 0 && !collapsed && (
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
                  onPin={() => onPinNote(note.id, !note.isPinned)}
                  collapsed={collapsed}
                />
              ))
            ) : (
              !collapsed && (
                <p className="text-sm text-muted-foreground p-2">
                  No notes found. Create a new one!
                </p>
              )
            )}
          </div>
        </div>
      </ScrollArea>
      
      {!collapsed && (
        <div className="p-4 border-t space-y-4">
          {/* Premium Upgrade Button */}
          <div className="bg-[#2A1E12] rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-white">Upgrade to Premium</h3>
            </div>
            <p className="text-gray-400 text-sm mb-3">
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
          
          {/* Settings, Shortcuts, Logout buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="flex items-center justify-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShortcutsOpen(true)}
              className="flex items-center justify-center gap-2"
            >
              <Keyboard className="h-4 w-4" />
              <span>Shortcuts</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 col-span-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      )}
      
      {collapsed && (
        <div className="p-2 border-t flex flex-col items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setShortcutsOpen(true)}
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
      
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
