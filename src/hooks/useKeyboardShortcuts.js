import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {Array} dependencies - Dependencies array for useEffect
 * 
 * Example usage:
 * useKeyboardShortcuts({
 *   'ctrl+s': handleSave,
 *   'ctrl+p': handlePrint,
 *   'escape': handleClose
 * });
 */
const useKeyboardShortcuts = (shortcuts, dependencies = []) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        // Allow Escape key even in inputs
        if (event.key !== 'Escape') {
          return;
        }
      }

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Build shortcut string
      let shortcut = '';
      if (ctrl) shortcut += 'ctrl+';
      if (shift) shortcut += 'shift+';
      if (alt) shortcut += 'alt+';
      shortcut += key;

      // Execute handler if shortcut exists
      if (shortcuts[shortcut]) {
        event.preventDefault();
        shortcuts[shortcut](event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, dependencies);
};

export default useKeyboardShortcuts;
