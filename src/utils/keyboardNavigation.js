/**
 * Keyboard Navigation Utilities
 * Provides helper functions for implementing keyboard accessibility
 */

/**
 * Trap focus within a modal or dialog
 * @param {HTMLElement} element - The container element to trap focus within
 */
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  element.addEventListener('keydown', handleTabKey);
  
  // Focus first element
  if (firstFocusable) {
    firstFocusable.focus();
  }

  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Handle keyboard navigation for lists
 * @param {KeyboardEvent} event - The keyboard event
 * @param {number} currentIndex - Current selected index
 * @param {number} totalItems - Total number of items
 * @param {Function} onSelect - Callback when item is selected
 * @returns {number} New index
 */
export const handleListNavigation = (event, currentIndex, totalItems, onSelect) => {
  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
      break;
    case 'ArrowUp':
      event.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = totalItems - 1;
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (onSelect) {
        onSelect(currentIndex);
      }
      break;
    default:
      return currentIndex;
  }

  return newIndex;
};

/**
 * Create keyboard shortcut handler
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @returns {Function} Event handler
 */
export const createShortcutHandler = (shortcuts) => {
  return (event) => {
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
      shortcuts[shortcut]();
    }
  };
};

/**
 * Focus management for skip links
 * @param {string} targetId - ID of element to focus
 */
export const skipToContent = (targetId) => {
  const target = document.getElementById(targetId);
  if (target) {
    target.setAttribute('tabindex', '-1');
    target.focus();
    target.addEventListener('blur', () => {
      target.removeAttribute('tabindex');
    }, { once: true });
  }
};

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
export const announceToScreenReader = (message, priority = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Get all focusable elements within a container
 * @param {HTMLElement} container - Container element
 * @returns {NodeList} Focusable elements
 */
export const getFocusableElements = (container) => {
  return container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
};

/**
 * Restore focus to previously focused element
 * @param {HTMLElement} element - Element to restore focus to
 */
export const restoreFocus = (element) => {
  if (element && typeof element.focus === 'function') {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      element.focus();
    }, 0);
  }
};
