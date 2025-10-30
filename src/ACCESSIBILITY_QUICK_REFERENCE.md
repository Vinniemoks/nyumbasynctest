# Accessibility Quick Reference

A quick guide for developers working on the Tenant Portal.

## Essential ARIA Attributes

### Buttons
```jsx
<button aria-label="Close dialog">
  <i className="fas fa-times" aria-hidden="true"></i>
</button>
```

### Links
```jsx
<Link to="/path" aria-label="View property details">
  View Details →
</Link>
```

### Form Fields
```jsx
<label htmlFor="email">Email <span aria-label="required">*</span></label>
<input 
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="email-error"
/>
{hasError && <p id="email-error" role="alert">{error}</p>}
```

### Modals
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description</p>
</div>
```

### Loading States
```jsx
<div role="status" aria-live="polite">
  <span className="sr-only">Loading...</span>
  <Spinner aria-hidden="true" />
</div>
```

### Error Messages
```jsx
<div role="alert" aria-live="assertive">
  <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
  {errorMessage}
</div>
```

## Keyboard Navigation

### Focus Management
```jsx
import { trapFocus, restoreFocus } from '../utils/keyboardNavigation';

// In modal
useEffect(() => {
  if (isOpen) {
    const cleanup = trapFocus(modalRef.current);
    return cleanup;
  }
}, [isOpen]);
```

### Keyboard Shortcuts
```jsx
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

useKeyboardShortcuts({
  'escape': handleClose,
  'ctrl+s': handleSave,
  'ctrl+p': handlePrint
});
```

### Focus Trap Component
```jsx
import FocusTrap from '../components/shared/FocusTrap';

<FocusTrap active={isOpen}>
  <div>{/* Modal content */}</div>
</FocusTrap>
```

## Semantic HTML

### Headings
```jsx
<h1>Page Title</h1>
<section>
  <h2>Section Title</h2>
  <h3>Subsection</h3>
</section>
```

### Landmarks
```jsx
<header role="banner">Header</header>
<nav role="navigation" aria-label="Main navigation">Nav</nav>
<main role="main">Main Content</main>
<aside>Sidebar</aside>
<footer>Footer</footer>
```

### Lists
```jsx
<ul role="list">
  <li role="listitem">Item 1</li>
  <li role="listitem">Item 2</li>
</ul>
```

## Screen Reader Support

### Hidden Content
```jsx
// Visually hidden but available to screen readers
<span className="sr-only">Additional context</span>

// Hidden from everyone
<i className="fas fa-icon" aria-hidden="true"></i>
```

### Live Regions
```jsx
// Polite (non-urgent)
<div aria-live="polite" aria-atomic="true">
  Status updated
</div>

// Assertive (urgent)
<div aria-live="assertive" role="alert">
  Error occurred!
</div>
```

### Announcements
```jsx
import { announceToScreenReader } from '../utils/keyboardNavigation';

announceToScreenReader('Payment successful', 'polite');
announceToScreenReader('Error: Payment failed', 'assertive');
```

## Common Patterns

### Skip Link
```jsx
import SkipLink from '../components/SkipLink';

<SkipLink targetId="main-content" />
<main id="main-content">Content</main>
```

### Image with Alt Text
```jsx
<img 
  src={image} 
  alt="Property exterior showing front entrance and garden"
/>

// Decorative image
<img src={decorative} alt="" aria-hidden="true" />
```

### Button Group
```jsx
<div role="group" aria-label="Form actions">
  <button>Cancel</button>
  <button>Submit</button>
</div>
```

### Radio Group
```jsx
<fieldset>
  <legend>Priority Level</legend>
  <div role="radiogroup" aria-label="Select priority">
    <label>
      <input type="radio" name="priority" value="low" />
      Low Priority
    </label>
  </div>
</fieldset>
```

### Tabs
```jsx
<div role="tablist" aria-label="Account sections">
  <button 
    role="tab" 
    aria-selected={isActive}
    aria-controls="panel-1"
  >
    Tab 1
  </button>
</div>
<div role="tabpanel" id="panel-1">
  Panel content
</div>
```

## CSS Classes

### Screen Reader Only
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Focus Visible
```css
*:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}
```

## Testing Checklist

### Before Committing
- [ ] All interactive elements have labels
- [ ] Heading hierarchy is correct
- [ ] Forms have associated labels
- [ ] Error messages are linked to fields
- [ ] Icons are hidden from screen readers
- [ ] Loading states are announced
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] No diagnostic errors

### Manual Testing
- [ ] Tab through entire page
- [ ] Test with keyboard only
- [ ] Test with NVDA/VoiceOver
- [ ] Verify focus order
- [ ] Check skip links work
- [ ] Test modal focus trap

## Resources

- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

## Common Mistakes to Avoid

❌ Don't use `<div>` for buttons
✅ Use `<button>` element

❌ Don't use `onClick` on non-interactive elements
✅ Use semantic interactive elements

❌ Don't hide focus indicators
✅ Ensure visible focus for keyboard users

❌ Don't use placeholder as label
✅ Always use proper `<label>` elements

❌ Don't use color alone to convey information
✅ Use text, icons, or patterns in addition to color

❌ Don't create keyboard traps (except modals)
✅ Ensure all content is reachable and escapable

❌ Don't use generic link text ("click here")
✅ Use descriptive link text ("View property details")

## Need Help?

1. Check the full guides:
   - `KEYBOARD_NAVIGATION.md`
   - `SCREEN_READER_GUIDE.md`
   - `ACCESSIBILITY_IMPLEMENTATION.md`

2. Test with tools:
   - axe DevTools browser extension
   - WAVE browser extension
   - Lighthouse accessibility audit

3. Test with screen readers:
   - NVDA (Windows)
   - VoiceOver (macOS)
