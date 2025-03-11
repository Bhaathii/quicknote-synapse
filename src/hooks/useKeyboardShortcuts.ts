
import { useEffect, useCallback } from "react";

interface ShortcutHandlers {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        // But allow the '?' shortcut even in inputs
        if (event.key !== "?") {
          return;
        }
      }

      let shortcutKey = "";

      // Build the shortcut key string
      if (event.ctrlKey) shortcutKey += "ctrl+";
      if (event.shiftKey) shortcutKey += "shift+";
      if (event.altKey) shortcutKey += "alt+";
      shortcutKey += event.key.toLowerCase();

      // Check if we have a handler for this shortcut
      const handler = handlers[shortcutKey];
      if (handler) {
        event.preventDefault();
        handler();
      }
    },
    [handlers]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
