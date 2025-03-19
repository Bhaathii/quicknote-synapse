
import React, { useEffect, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Note } from "@/hooks/useNotes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading, 
  Quote,
  Trash2,
  Keyboard
} from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";

interface NoteEditorProps {
  note: Note | null;
  onUpdate: (id: string, data: Partial<Omit<Note, "id">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const AUTOSAVE_DELAY = 750; // milliseconds

export function NoteEditor({ 
  note, 
  onUpdate, 
  onDelete
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || "");
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your note...',
      }),
    ],
    content: note?.content || "",
    onUpdate: ({ editor }) => {
      if (!note) return;
      
      const html = editor.getHTML();
      handleContentChange(html);
    },
  });
  
  // Timer ref for debounced save
  const timerRef = React.useRef<number | null>(null);
  
  // Save note with debounce
  const saveNote = useCallback((id: string, data: Partial<Omit<Note, "id">>) => {
    setShowSaveIndicator(true);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    timerRef.current = window.setTimeout(async () => {
      await onUpdate(id, data);
      setShowSaveIndicator(false);
    }, AUTOSAVE_DELAY);
  }, [onUpdate]);

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    if (note) {
      saveNote(note.id, { title: newTitle });
    }
  };
  
  // Handle content change (debounced)
  const handleContentChange = useCallback((content: string) => {
    if (note) {
      saveNote(note.id, { content });
    }
  }, [note, saveNote]);
  
  // Handle delete note
  const handleDelete = async () => {
    if (note && window.confirm("Are you sure you want to delete this note?")) {
      await onDelete(note.id);
    }
  };
  
  // Register editor shortcut handlers
  useKeyboardShortcuts({
    "ctrl+b": () => editor?.chain().focus().toggleBold().run(),
    "ctrl+i": () => editor?.chain().focus().toggleItalic().run(),
    "ctrl+h": () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    "ctrl+l": () => editor?.chain().focus().toggleBulletList().run(),
    "ctrl+shift+l": () => editor?.chain().focus().toggleOrderedList().run(),
    "ctrl+q": () => editor?.chain().focus().toggleBlockquote().run(),
    "ctrl+delete": () => note && handleDelete(),
    "ctrl+s": () => {
      // Manual save - fixed type error by removing the parameter
      if (note) {
        setShowSaveIndicator(true);
        onUpdate(note.id, { content: editor?.getHTML() || "", title })
          .then(() => {
            setTimeout(() => setShowSaveIndicator(false), 800);
          });
      }
    },
    "?": () => setShowKeyboardShortcuts(true),
  });
  
  // Update editor when note changes
  useEffect(() => {
    if (editor && note) {
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content);
      }
      setTitle(note.title);
    }
  }, [editor, note]);
  
  // If no note is selected, show empty state
  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <h3 className="text-xl font-medium mb-2">No note selected</h3>
          <p className="text-muted-foreground">
            Select a note from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2 relative p-2">
        <Input
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="text-xl font-medium border-none bg-transparent focus-visible:ring-0 px-2"
        />
        <div className="flex items-center gap-2">
          {showSaveIndicator && (
            <span className="text-xs text-muted-foreground animate-fade-in">
              Saving...
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowKeyboardShortcuts(true)}
            aria-label="Keyboard shortcuts"
            className="text-muted-foreground hover:text-foreground"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive/90"
            aria-label="Delete note"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {editor && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex gap-1 mb-2 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(editor.isActive('bold') ? 'bg-muted' : '')}
              aria-label="Bold"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(editor.isActive('italic') ? 'bg-muted' : '')}
              aria-label="Italic"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(editor.isActive('heading', { level: 2 }) ? 'bg-muted' : '')}
              aria-label="Heading"
              title="Heading (Ctrl+H)"
            >
              <Heading className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(editor.isActive('bulletList') ? 'bg-muted' : '')}
              aria-label="Bullet list"
              title="Bullet List (Ctrl+L)"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(editor.isActive('orderedList') ? 'bg-muted' : '')}
              aria-label="Ordered list"
              title="Ordered List (Ctrl+Shift+L)"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(editor.isActive('blockquote') ? 'bg-muted' : '')}
              aria-label="Quote"
              title="Quote (Ctrl+Q)"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <EditorContent 
              editor={editor} 
              className="prose dark:prose-invert prose-sm h-full max-w-none focus:outline-none"
            />
          </div>
        </div>
      )}
      
      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />
    </div>
  );
}
