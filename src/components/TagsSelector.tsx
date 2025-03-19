
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, X, Plus } from "lucide-react";

interface TagsSelectorProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
  onAddTagToNote?: (tag: string) => void;
  onRemoveTagFromNote?: (tag: string) => void;
  noteTags?: string[];
  isFilterMode?: boolean;
}

export function TagsSelector({
  tags,
  selectedTags,
  onToggleTag,
  onClearTags,
  onAddTagToNote,
  onRemoveTagFromNote,
  noteTags = [],
  isFilterMode = false,
}: TagsSelectorProps) {
  const [newTag, setNewTag] = useState("");
  
  const handleAddTag = () => {
    if (newTag.trim() && onAddTagToNote) {
      onAddTagToNote(newTag.trim());
      setNewTag("");
    }
  };
  
  return (
    <div className="space-y-2">
      {isFilterMode && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Filter by Tags</h3>
          {selectedTags.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearTags}
              className="h-auto py-1 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      )}
      
      {!isFilterMode && onAddTagToNote && (
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="Add new tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="h-8 px-2"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {isFilterMode ? (
          // For filter mode, show all available tags
          tags.length > 0 ? (
            tags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-secondary transition-colors"
                onClick={() => onToggleTag(tag)}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">No tags available</div>
          )
        ) : (
          // For note mode, show the note's tags
          noteTags.length > 0 ? (
            noteTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer group"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
                {onRemoveTagFromNote && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTagFromNote(tag);
                    }}
                    className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">No tags on this note</div>
          )
        )}
      </div>
    </div>
  );
}
