
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface ShortcutItemProps {
  keys: string[];
  description: string;
}

const ShortcutItem = ({ keys, description }: ShortcutItemProps) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-sm">{description}</span>
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        >
          {key}
        </kbd>
      ))}
    </div>
  </div>
);

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const editorShortcuts = [
    { keys: ["Ctrl", "B"], description: "Bold text" },
    { keys: ["Ctrl", "I"], description: "Italic text" },
    { keys: ["Ctrl", "H"], description: "Toggle heading" },
    { keys: ["Ctrl", "L"], description: "Toggle bullet list" },
    { keys: ["Ctrl", "Shift", "L"], description: "Toggle ordered list" },
    { keys: ["Ctrl", "Q"], description: "Toggle quote block" },
  ];

  const appShortcuts = [
    { keys: ["Ctrl", "N"], description: "Create new note" },
    { keys: ["Ctrl", "/"], description: "Focus search" },
    { keys: ["Ctrl", "S"], description: "Manual save" },
    { keys: ["Ctrl", "Delete"], description: "Delete current note" },
    { keys: ["?"], description: "Show keyboard shortcuts" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to speed up your workflow
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div>
            <h3 className="font-medium mb-2 text-sm text-primary">Editor</h3>
            <div className="border rounded-lg divide-y">
              {editorShortcuts.map((shortcut, index) => (
                <ShortcutItem
                  key={index}
                  keys={shortcut.keys}
                  description={shortcut.description}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-sm text-primary">
              Application
            </h3>
            <div className="border rounded-lg divide-y">
              {appShortcuts.map((shortcut, index) => (
                <ShortcutItem
                  key={index}
                  keys={shortcut.keys}
                  description={shortcut.description}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
