import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { NoteEditor } from "@/components/NoteEditor";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { useNotes } from "@/hooks/useNotes";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { AlertCircle, MessageSquare, Mail, AlertTriangle } from "lucide-react";

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
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const [authForm, setAuthForm] = useState<AuthFormData>({
    email: "",
    password: "",
    isLogin: true,
  });
  const [googleAuthError, setGoogleAuthError] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState<any[]>([]);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  
  const {
    notes,
    activeNote,
    setActiveNote,
    loading: notesLoading,
    error: notesError,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    getCategories,
    filterByCategory
  } = useNotes();
  
  // Register app-level keyboard shortcuts
  useKeyboardShortcuts({
    "ctrl+n": () => {
      if (user) {
        createNote(selectedCategory !== "All" ? selectedCategory : undefined);
      }
    },
    "ctrl+/": () => {
      if (user && searchInputRef) {
        searchInputRef.focus();
      }
    },
  });
  
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
  
  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      setGoogleAuthError(false);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Google authentication error:", error);
      if (error.code === "auth/unauthorized-domain") {
        setGoogleAuthError(true);
      }
    }
  };
  
  // Toggle between login and register forms
  const toggleAuthMode = () => {
    setAuthForm((prev) => ({
      ...prev,
      isLogin: !prev.isLogin,
    }));
    setGoogleAuthError(false);
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

  // Handle category selection
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setFilteredNotes([]);
  };

  // Handle adding a new category
  const handleAddCategory = (category: string) => {
    if (!customCategories.includes(category)) {
      setCustomCategories(prev => [...prev, category]);
    }
    setSelectedCategory(category);
  };
  
  // Get all categories
  const allCategories = notes.length > 0 
    ? getCategories().concat(customCategories.filter(cat => !getCategories().includes(cat)))
    : ["All", "Uncategorized", ...customCategories];
  
  // Filter displayed notes based on search and category
  const displayedNotes = filteredNotes?.length > 0 
    ? filteredNotes 
    : selectedCategory !== "All" 
      ? filterByCategory(selectedCategory)
      : notes;
  
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
            
            {googleAuthError && (
              <div className="p-3 bg-destructive/15 border border-destructive rounded-md flex items-center text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <p>Google sign-in not available on this domain. Please use email and password.</p>
              </div>
            )}
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleSignIn}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Sign in with Google
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
      {/* Display error state if notes failed to fetch */}
      {notesError && (
        <div className="fixed top-0 left-0 right-0 p-4 bg-destructive text-destructive-foreground z-50 flex items-center justify-center">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span>Error: {notesError}. Please refresh the page.</span>
        </div>
      )}
      
      <Sidebar
        notes={displayedNotes}
        activeNote={activeNote}
        onSelectNote={setActiveNote}
        onCreateNote={(category) => createNote(category)}
        onPinNote={(id, isPinned) => updateNote(id, { isPinned })}
        onSearch={handleSearch}
        searchInputRef={setSearchInputRef}
        categories={allCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onAddCategory={handleAddCategory}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-end p-2 border-b">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFeedbackOpen(true)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Feedback
            </Button>
            
            <VoiceRecorder 
              onTranscription={handleTranscription} 
              isPremium={false} // Set to true for premium users
            />
          </div>
        </div>
        
        <div className={cn(
          "flex-1 overflow-hidden",
          notesLoading ? "opacity-50" : "opacity-100"
        )}>
          <NoteEditor
            note={activeNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
            categories={allCategories.filter(cat => cat !== "All")}
          />
        </div>
      </div>
      
      <FeedbackDialog 
        open={feedbackOpen} 
        onOpenChange={setFeedbackOpen} 
      />
    </div>
  );
}
