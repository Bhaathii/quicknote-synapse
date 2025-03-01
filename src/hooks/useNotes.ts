
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
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
            
            setNotes(sortedNotes);
            setLoading(false);
            setError(null);
            
            // Set active note to the first note if no active note
            if (sortedNotes.length > 0 && !activeNote) {
              setActiveNote(sortedNotes[0]);
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
  }, [user, activeNote, toast]);

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
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
  };
}
