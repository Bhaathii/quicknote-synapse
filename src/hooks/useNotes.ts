
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
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch notes from Firestore
  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    const notesQuery = query(
      collection(db, "notes"),
      where("userId", "==", user.uid),
      orderBy("isPinned", "desc"),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const notesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[];
        
        setNotes(notesList);
        setLoading(false);
        
        // Set active note to the first note if no active note
        if (notesList.length > 0 && !activeNote) {
          setActiveNote(notesList[0]);
        }
      },
      (error) => {
        console.error("Error fetching notes:", error);
        toast({
          title: "Error",
          description: "Failed to fetch notes",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Error",
        description: "Failed to create note",
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
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error",
        description: "Failed to update note",
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
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  // Search notes
  const searchNotes = async (query: string) => {
    if (!user || !query.trim()) {
      return notes;
    }

    const notesQuery = collection(db, "notes");
    const q = query(notesQuery, where("userId", "==", user.uid));
    const snapshot = await getDocs(q);
    
    const allNotes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];
    
    // Filter notes based on query
    return allNotes.filter(
      (note) =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    notes,
    activeNote,
    setActiveNote,
    loading,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
  };
}
