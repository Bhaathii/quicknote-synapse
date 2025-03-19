
import { useState, useEffect } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  Timestamp, 
  getDocs 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPinned: boolean;
  userId: string;
  tags: string[]; // Added tags array
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]); // Track all available tags
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Track selected tags for filtering
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch notes from Firestore
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try a simpler query first to ensure we can get some data
      // This is a fallback query without complex sorting that shouldn't require a composite index
      const notesQuery = query(
        collection(db, "notes"),
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(
        notesQuery,
        (snapshot) => {
          try {
            const notesList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
              tags: doc.data().tags || [], // Ensure tags exist
            })) as Note[];
            
            // Sort notes in memory as a fallback for the missing index
            // First by isPinned (true first), then by updatedAt (newest first)
            const sortedNotes = [...notesList].sort((a, b) => {
              // First sort by isPinned
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              
              // Then sort by updatedAt
              const aTime = a.updatedAt?.toMillis() || 0;
              const bTime = b.updatedAt?.toMillis() || 0;
              return bTime - aTime; // Descending order (newest first)
            });
            
            // Extract all unique tags
            const allTags = new Set<string>();
            sortedNotes.forEach(note => {
              if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach(tag => allTags.add(tag));
              }
            });
            setTags(Array.from(allTags).sort());
            
            // Filter notes by selected tags if any
            const filteredNotes = selectedTags.length > 0
              ? sortedNotes.filter(note => 
                  selectedTags.every(tag => note.tags && note.tags.includes(tag))
                )
              : sortedNotes;
            
            setNotes(filteredNotes);
            setLoading(false);
            setError(null);
            
            // Set active note to the first note if no active note
            if (filteredNotes.length > 0 && !activeNote) {
              setActiveNote(filteredNotes[0]);
            } else if (activeNote && !filteredNotes.find(n => n.id === activeNote.id)) {
              // If active note is filtered out, set to first note
              setActiveNote(filteredNotes.length > 0 ? filteredNotes[0] : null);
            }
          } catch (err: any) {
            console.error("Error processing notes data:", err);
            setError("Error processing notes data: " + err.message);
            setLoading(false);
          }
        },
        (err) => {
          console.error("Error fetching notes:", err);
          
          // Check if it's a missing index error
          if (err.code === "failed-precondition" && err.message.includes("index")) {
            setError(
              "This query requires a Firestore index. Please create the index and refresh the page. " +
              "See console for details."
            );
            console.warn("Missing Firestore index. Create it here:", err.message);
          } else {
            setError("Failed to fetch notes: " + err.message);
          }
          
          setLoading(false);
          
          toast({
            title: "Error",
            description: "Failed to fetch notes. See details on screen.",
            variant: "destructive",
          });
        }
      );

      return () => unsubscribe();
    } catch (error: any) {
      console.error("Error setting up notes listener:", error);
      setError("Error setting up notes listener: " + error.message);
      setLoading(false);
      
      toast({
        title: "Error",
        description: "Failed to set up notes listener: " + error.message,
        variant: "destructive",
      });
    }
  }, [user, activeNote, selectedTags, toast]);

  // Create a new note
  const createNote = async () => {
    try {
      if (!user) return;

      const newNote = {
        title: "Untitled Note",
        content: "",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isPinned: false,
        userId: user.uid,
        tags: [], // Initialize with empty tags array
      };

      const docRef = await addDoc(collection(db, "notes"), newNote);
      
      // Set the new note as active
      setActiveNote({
        id: docRef.id,
        ...newNote,
      });
      
      toast({
        title: "Note created",
        description: "New note has been created",
      });
    } catch (error: any) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Update a note
  const updateNote = async (id: string, data: Partial<Omit<Note, "id">>) => {
    try {
      const noteRef = doc(db, "notes", id);
      
      await updateDoc(noteRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      
      // Update active note if it's being edited
      if (activeNote && activeNote.id === id) {
        setActiveNote((prev) => 
          prev ? { ...prev, ...data, updatedAt: Timestamp.now() } : prev
        );
      }
    } catch (error: any) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Add a tag to a note
  const addTagToNote = async (noteId: string, tag: string) => {
    try {
      const noteRef = doc(db, "notes", noteId);
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        throw new Error("Note not found");
      }
      
      // Create a new tags array to avoid duplicates
      const newTags = [...(note.tags || [])];
      if (!newTags.includes(tag)) {
        newTags.push(tag);
      }
      
      await updateDoc(noteRef, {
        tags: newTags,
        updatedAt: Timestamp.now(),
      });
      
      // Update active note if it's the one being tagged
      if (activeNote && activeNote.id === noteId) {
        setActiveNote(prev => 
          prev ? { ...prev, tags: newTags, updatedAt: Timestamp.now() } : prev
        );
      }
      
      toast({
        title: "Tag added",
        description: `Added tag "${tag}" to note`,
      });
    } catch (error: any) {
      console.error("Error adding tag:", error);
      toast({
        title: "Error",
        description: "Failed to add tag: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Remove a tag from a note
  const removeTagFromNote = async (noteId: string, tag: string) => {
    try {
      const noteRef = doc(db, "notes", noteId);
      const note = notes.find(n => n.id === noteId);
      
      if (!note || !note.tags) {
        throw new Error("Note or tags not found");
      }
      
      const newTags = note.tags.filter(t => t !== tag);
      
      await updateDoc(noteRef, {
        tags: newTags,
        updatedAt: Timestamp.now(),
      });
      
      // Update active note if it's the one being modified
      if (activeNote && activeNote.id === noteId) {
        setActiveNote(prev => 
          prev ? { ...prev, tags: newTags, updatedAt: Timestamp.now() } : prev
        );
      }
      
      toast({
        title: "Tag removed",
        description: `Removed tag "${tag}" from note`,
      });
    } catch (error: any) {
      console.error("Error removing tag:", error);
      toast({
        title: "Error",
        description: "Failed to remove tag: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Filter notes by tag
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // Clear all tag filters
  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  // Delete a note
  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notes", id));
      
      // If deleted note was active, set active to first available note
      if (activeNote && activeNote.id === id) {
        const remainingNotes = notes.filter((note) => note.id !== id);
        setActiveNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
      }
      
      toast({
        title: "Note deleted",
        description: "Note has been deleted",
      });
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Search notes
  const searchNotes = async (searchQuery: string) => {
    if (!user || !searchQuery.trim()) {
      return notes;
    }

    try {
      const notesRef = collection(db, "notes");
      const q = query(notesRef, where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      
      const allNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Note[];
      
      // Filter notes based on query
      return allNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } catch (error: any) {
      console.error("Error searching notes:", error);
      toast({
        title: "Error",
        description: "Failed to search notes: " + error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    notes,
    activeNote,
    setActiveNote,
    loading,
    error,
    tags,
    selectedTags,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    addTagToNote,
    removeTagFromNote,
    toggleTagFilter,
    clearTagFilters,
  };
}
