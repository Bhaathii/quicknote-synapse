
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useNotes } from "@/hooks/useNotes";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

interface AuthFormData {
  email: string;
  password: string;
  isLogin: boolean;
}

export default function Index() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, loading, signIn, signUp } = useAuth();
  const [authForm, setAuthForm] = useState<AuthFormData>({
    email: "",
    password: "",
    isLogin: true,
  });
  const [filteredNotes, setFilteredNotes] = useState<any[]>([]);
  
  const {
    notes,
    activeNote,
    setActiveNote,
    loading: notesLoading,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
  } = useNotes();
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle auth form submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, isLogin } = authForm;
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };
  
  // Toggle between login and register forms
  const toggleAuthMode = () => {
    setAuthForm((prev) => ({
      ...prev,
      isLogin: !prev.isLogin,
    }));
  };

  // Handle search
  const handleSearch = async (query: string) => {
    if (!query || query.trim() === "") {
      setFilteredNotes([]);
      return;
    }
    
    const results = await searchNotes(query);
    setFilteredNotes(results);
  };
  
  // Handle voice transcription
  const handleTranscription = (text: string) => {
    if (activeNote) {
      // Append the transcription to current note content
      const updatedContent = activeNote.content 
        ? `${activeNote.content}<p>${text}</p>` 
        : `<p>${text}</p>`;
      
      updateNote(activeNote.id, { content: updatedContent });
    }
  };
  
  // Filter displayed notes based on search
  const displayedNotes = filteredNotes.length > 0 ? filteredNotes : notes;
  
  // Auth form rendering
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="w-full max-w-md p-8 space-y-8 bg-card text-card-foreground rounded-xl shadow-lg glass animate-fade-in">
          <div className="text-center">
            <h1 className="text-3xl font-bold">QuickNote</h1>
            <p className="mt-2 text-muted-foreground">
              {authForm.isLogin ? "Sign in to your account" : "Create a new account"}
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleAuthSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={authForm.email}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={authForm.isLogin ? "current-password" : "new-password"}
                  required
                  value={authForm.password}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              {authForm.isLogin ? "Sign in" : "Sign up"}
            </Button>
            
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-primary hover:underline"
              >
                {authForm.isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  // Main app rendering (when authenticated)
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        notes={displayedNotes}
        activeNote={activeNote}
        onSelectNote={setActiveNote}
        onCreateNote={createNote}
        onPinNote={(id, isPinned) => updateNote(id, { isPinned })}
        onSearch={handleSearch}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-end p-2 border-b">
          <VoiceRecorder 
            onTranscription={handleTranscription} 
            isPremium={false} // Set to true for premium users
          />
        </div>
        
        <div className={cn(
          "flex-1 overflow-hidden",
          notesLoading ? "opacity-50" : "opacity-100"
        )}>
          <NoteEditor
            note={activeNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        </div>
      </div>
    </div>
  );
}
