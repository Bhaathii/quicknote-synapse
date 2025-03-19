
import React, { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onAddCategory: (category: string) => void;
  className?: string;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  className
}: CategorySelectorProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory("");
      setIsAddingNew(false);
    }
  };

  return (
    <div className={className}>
      {!isAddingNew ? (
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={onSelectCategory}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60">
              <div className="space-y-2">
                <h4 className="font-medium">Add new category</h4>
                <div className="flex gap-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                  />
                  <Button size="sm" onClick={handleAddCategory}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="New category name"
            autoFocus
          />
          <Button variant="default" size="sm" onClick={handleAddCategory}>
            Add
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingNew(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
