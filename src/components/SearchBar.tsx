
import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchInputRef?: (ref: HTMLInputElement | null) => void;
}

export function SearchBar({ onSearch, searchInputRef }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Register the input ref with the parent if needed
  React.useEffect(() => {
    if (searchInputRef && inputRef.current) {
      searchInputRef(inputRef.current);
    }
    
    return () => {
      if (searchInputRef) {
        searchInputRef(null);
      }
    };
  }, [searchInputRef]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative w-full">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search notes... (Ctrl+/)"
        className="w-full rounded-md pl-8"
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}
