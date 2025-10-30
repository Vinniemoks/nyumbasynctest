# Keyboard Navigation Guide

This document outlines the keyboard navigation features implemented in the Tenant Portal.

## Global Keyboard Shortcuts

### Navigation
- **Tab**: Move focus forward through interactive elements
- **Shift + Tab**: Move focus backward through interactive elements
- **Enter**: Activate buttons, links, and other interactive elements
- **Space**: Activate buttons and toggle checkboxes
- **Escape**: Close modals, dialogs, and dropdowns

### Skip Links
- **Tab (on page load)**: Reveals "Skip to main content" link
- **Enter (on skip link)**: Jumps directly to main content area

## Component-Specific Navigation

### Sidebar Navigation
- **Tab**: Navigate through menu items
- **Enter/Space**: Activate selected menu item
- **Escape**: Close mobile menu (on mobile devices)

### Modals and Dialogs
- **Tab**: Navigate through modal controls (focus is trapped within modal)
- **Escape**: Close modal
- **Enter**: Confirm action (on confirm button)

### Date Picker
- **Tab**: Open calendar dropdown
- **Arrow Keys**: Navigate between dates
- **Home**: Jump to first day of month
- **End**: Jump to last day of month
- **Page Up**: Previous month
- **Page Down**: Next month
- **Enter/Space**: Select date
- **Escape**: Close calendar

### Image Gallery
- **Tab**: Navigate to gallery controls
- **Enter/Space**: Open lightbox
- **Arrow Left**: Previous image (in lightbox)
- **Arrow Right**: Next image (in lightbox)
- **Escape**: Close lightbox

### Forms
- **Tab**: Move between form fields
- **Enter**: Submit form (when on submit button)
- **Space**: Toggle checkboxes and radio buttons
- **Arrow Keys**: Navigate radio button groups

### Lists and Grids
- **Arrow Keys**: Navigate through items
- **Home**: Jump to first item
- **End**: Jump to last item
- **Enter/Space**: Select item

## Focus Management

### Focus Indicators
All interactive elements display a visible focus indicator (blue outline) when focused via keyboard navigation. This helps users track their position on the page.

### Focus Trapping
Modals and dialogs trap focus within their boundaries, preventing users from accidentally navigating outside the modal context.

### Focus Restoration
When closing modals or dialogs, focus is automatically restored to the element that triggered the modal.

## Accessibility Features

### Screen Reader Support
- All interactive elements have descriptive labels
- Status messages are announced to screen readers
- Form errors are associated with their fields
- Loading states are announced

### ARIA Attributes
- `role`: Defines element purpose
- `aria-label`: Provides accessible names
- `aria-labelledby`: Associates labels with elements
- `aria-describedby`: Provides additional descriptions
- `aria-expanded`: Indicates expandable element state
- `aria-current`: Indicates current page/item
- `aria-live`: Announces dynamic content changes
- `aria-modal`: Identifies modal dialogs

### Skip Links
A "Skip to main content" link appears at the top of the page when focused, allowing keyboard users to bypass navigation and jump directly to the main content.

## Testing Keyboard Navigation

### Manual Testing
1. Use only the keyboard (no mouse)
2. Tab through all interactive elements
3. Verify focus indicators are visible
4. Test all keyboard shortcuts
5. Ensure no keyboard traps exist
6. Verify focus order is logical

### Screen Reader Testing
1. Test with NVDA (Windows) or VoiceOver (Mac)
2. Verify all content is announced correctly
3. Check form labels and error messages
4. Test navigation landmarks
5. Verify dynamic content announcements

## Browser Support

Keyboard navigation is supported in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Implementation Details

### Utilities
- `src/utils/keyboardNavigation.js`: Helper functions for keyboard navigation
- `src/hooks/useKeyboardShortcuts.js`: Custom hook for keyboard shortcuts
- `src/components/shared/FocusTrap.jsx`: Focus trap component for modals
- `src/components/SkipLink.jsx`: Skip navigation link component

### CSS
- Focus indicators defined in `src/index.css`
- Support for high contrast mode
- Support for reduced motion preferences

## Future Enhancements

- [ ] Add more global keyboard shortcuts (e.g., Ctrl+K for search)
- [ ] Implement keyboard shortcuts help dialog (?)
- [ ] Add keyboard navigation for data tables
- [ ] Implement roving tabindex for complex widgets
- [ ] Add keyboard shortcuts customization

## Resources

- [WCAG 2.1 Keyboard Accessible Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/keyboard-accessible)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
