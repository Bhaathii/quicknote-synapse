
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function UserProfile({ className }: { className?: string }) {
  const { user } = useAuth();
  
  if (!user) return null;
  
  // Get the first letter of the email or display name for the fallback
  const fallbackText = user.displayName 
    ? user.displayName.charAt(0).toUpperCase()
    : user.email 
      ? user.email.charAt(0).toUpperCase() 
      : "U";
  
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <Avatar>
        {user.photoURL ? (
          <AvatarImage src={user.photoURL} alt={user.displayName || user.email || "User"} />
        ) : null}
        <AvatarFallback>{fallbackText}</AvatarFallback>
      </Avatar>
      <div className="space-y-0.5">
        <p className="text-sm font-medium leading-none">
          {user.displayName || user.email?.split('@')[0] || "User"}
        </p>
        {user.displayName && user.email ? (
          <p className="text-xs text-muted-foreground truncate max-w-[140px]">
            {user.email}
          </p>
        ) : null}
      </div>
    </div>
  );
}
