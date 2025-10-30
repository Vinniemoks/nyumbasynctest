import { useEffect, useRef } from 'react';

/**
 * FocusTrap component
 * Traps focus within its children (useful for modals and dialogs)
 */
const FocusTrap = ({ children, active = true, restoreFocus = true }) => {
  const containerRef = useRef(null);
  const previouslyFocusedElement = useRef(null);

  useEffect(() => {
    if (!active) return;

    // Store currently focused element
    previouslyFocusedElement.current = document.activeElement;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

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

    // Add event listener
    container.addEventListener('keydown', handleTabKey);

    // Focus first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Cleanup
    return () => {
      container.removeEventListener('keydown', handleTabKey);

      // Restore focus to previously focused element
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [active, restoreFocus]);

  return <div ref={containerRef}>{children}</div>;
};

export default FocusTrap;
