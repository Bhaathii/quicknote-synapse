
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MessageCircle, ThumbsUp, User } from "lucide-react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  rating: number;
  createdAt: Timestamp;
}

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [userName, setUserName] = useState("");
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch feedback when dialog opens
  useEffect(() => {
    if (open) {
      fetchFeedback();
      
      // Set user's display name if available
      if (user?.displayName) {
        setUserName(user.displayName);
      } else if (user?.email) {
        // Use email username as default name
        setUserName(user.email.split('@')[0]);
      }
    }
  }, [open, user]);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const feedbackQuery = query(
        collection(db, "feedback"),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(feedbackQuery);
      const feedbackData: FeedbackItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FeedbackItem));
      
      setFeedbackList(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty feedback",
        description: "Please enter your feedback before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        userId: user?.uid || "anonymous",
        userName: userName || "Anonymous User",
        userPhoto: user?.photoURL || null,
        content,
        rating,
        createdAt: serverTimestamp()
      });
      
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      setContent("");
      
      // Refresh feedback list
      fetchFeedback();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageCircle className="mr-2 h-5 w-5" />
            User Feedback
          </DialogTitle>
          <DialogDescription>
            Share your thoughts and see what others are saying
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4 flex-grow overflow-auto">
          {/* Feedback submission form */}
          <div className="space-y-4 border-b pb-4">
            <div>
              <label htmlFor="username" className="text-sm font-medium">
                Your Name
              </label>
              <Input
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name (optional)"
                className="mt-1"
              />
            </div>
            
            <div>
              <label htmlFor="feedback" className="text-sm font-medium">
                Your Feedback
              </label>
              <Textarea
                id="feedback"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, suggestions, or report issues..."
                className="mt-1 min-h-[100px]"
              />
            </div>
            
            <div>
              <label htmlFor="rating" className="text-sm font-medium">
                Rating
              </label>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`p-1 ${
                      value <= rating ? "text-yellow-500" : "text-gray-300"
                    }`}
                    aria-label={`Rate ${value} stars`}
                  >
                    <ThumbsUp className="h-5 w-5" />
                  </button>
                ))}
                <span className="ml-2 text-sm">{rating}/5</span>
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !content.trim()}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
          
          {/* Feedback list */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Recent Feedback</h3>
            
            {isLoading ? (
              <div className="text-center py-4">Loading feedback...</div>
            ) : feedbackList.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No feedback yet. Be the first to share your thoughts!
              </div>
            ) : (
              <div className="space-y-4">
                {feedbackList.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 bg-accent/20">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <Avatar className="h-6 w-6 mr-2">
                          {item.userPhoto ? (
                            <AvatarImage src={item.userPhoto} alt={item.userName} />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {item.userName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium">{item.userName}</span>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <ThumbsUp className="h-4 w-4" />
                        <span className="ml-1 text-xs">{item.rating}/5</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm">{item.content}</p>
                    {item.createdAt && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDistanceToNow(item.createdAt.toDate(), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
