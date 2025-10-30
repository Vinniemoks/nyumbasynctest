# Screen Reader Compatibility Guide

This document outlines the screen reader support implemented in the Tenant Portal and provides testing guidelines.

## Supported Screen Readers

- **NVDA** (Windows) - Free and open source
- **JAWS** (Windows) - Commercial
- **VoiceOver** (macOS/iOS) - Built-in
- **TalkBack** (Android) - Built-in
- **Narrator** (Windows) - Built-in

## ARIA Implementation

### Landmark Roles

The application uses semantic HTML5 elements and ARIA landmarks for easy navigation:

- `<header role="banner">` - Site header with logo and user controls
- `<nav role="navigation">` - Main navigation sidebar
- `<main role="main">` - Primary content area
- `<aside>` - Supplementary content
- `<footer>` - Site footer (if applicable)

### Form Labels and Descriptions

All form fields have:
- Associated `<label>` elements with `htmlFor` attribute
- `aria-label` for icon-only buttons
- `aria-describedby` for help text and error messages
- `aria-required` for required fields
- `aria-invalid` for fields with errors

### Dynamic Content

Dynamic content updates are announced using:
- `aria-live="polite"` - For non-critical updates
- `aria-live="assertive"` - For important alerts and errors
- `aria-atomic="true"` - To announce entire region
- `role="status"` - For status messages
- `role="alert"` - For error messages

### Interactive Elements

All interactive elements have:
- Descriptive accessible names
- Appropriate ARIA roles
- State information (`aria-expanded`, `aria-pressed`, `aria-checked`)
- Current page/item indication (`aria-current`)

## Component-Specific Screen Reader Support

### Navigation
- Menu items announce their label and current state
- Active page is indicated with `aria-current="page"`
- Expandable menus announce expanded/collapsed state

### Forms
- All fields have descriptive labels
- Required fields are announced
- Error messages are associated with fields
- Help text provides additional context
- Form submission status is announced

### Modals and Dialogs
- Modal opening is announced
- Focus is trapped within modal
- Modal title is announced via `aria-labelledby`
- Modal description via `aria-describedby`
- Close button is clearly labeled

### Data Tables
- Tables have captions or `aria-label`
- Column headers are properly marked
- Row headers where applicable
- Complex tables use `scope` attribute

### Status Messages
- Loading states are announced
- Success messages are announced
- Error messages are announced immediately
- Progress updates are announced

### Images
- All images have descriptive alt text
- Decorative images use `alt=""` or `aria-hidden="true"`
- Complex images have extended descriptions

## Testing with Screen Readers

### NVDA (Windows)

1. **Installation**
   - Download from https://www.nvaccess.org/
   - Install and restart computer

2. **Basic Commands**
   - `Ctrl` - Stop reading
   - `Insert + Down Arrow` - Read all
   - `Tab` - Next interactive element
   - `H` - Next heading
   - `F` - Next form field
   - `B` - Next button
   - `L` - Next link
   - `Insert + F7` - List all elements

3. **Testing Checklist**
   - [ ] All text content is read correctly
   - [ ] Headings are announced with level
   - [ ] Links announce their purpose
   - [ ] Buttons announce their action
   - [ ] Form fields announce label and type
   - [ ] Error messages are announced
   - [ ] Dynamic content updates are announced
   - [ ] Modal dialogs are announced
   - [ ] Tables are navigable

### VoiceOver (macOS)

1. **Activation**
   - `Cmd + F5` - Toggle VoiceOver
   - Or: System Preferences > Accessibility > VoiceOver

2. **Basic Commands**
   - `VO + A` - Read all (VO = Ctrl + Option)
   - `VO + Right Arrow` - Next item
   - `VO + Left Arrow` - Previous item
   - `VO + Space` - Activate item
   - `VO + U` - Rotor (list elements)
   - `VO + H` - Next heading
   - `VO + J` - Next form control

3. **Testing Checklist**
   - [ ] Rotor shows all landmarks
   - [ ] Rotor shows all headings
   - [ ] Rotor shows all form controls
   - [ ] Rotor shows all links
   - [ ] All interactive elements are accessible
   - [ ] Focus order is logical
   - [ ] Dynamic content is announced

### Testing Procedure

1. **Initial Page Load**
   - Verify page title is announced
   - Check that main heading is announced
   - Ensure skip link is available

2. **Navigation**
   - Tab through all interactive elements
   - Verify focus order is logical
   - Check that all elements are reachable
   - Test skip links work correctly

3. **Forms**
   - Navigate to each form field
   - Verify labels are announced
   - Check required fields are indicated
   - Test error message announcements
   - Verify help text is associated

4. **Dynamic Content**
   - Test loading states are announced
   - Verify success messages are heard
   - Check error alerts are immediate
   - Test live region updates

5. **Modals and Dialogs**
   - Verify modal opening is announced
   - Check focus moves to modal
   - Test focus trap works
   - Verify close button is accessible
   - Check focus returns on close

6. **Images and Media**
   - Verify all images have alt text
   - Check decorative images are hidden
   - Test image galleries are navigable

## Common Issues and Solutions

### Issue: Form field not announced
**Solution**: Add `<label>` with `htmlFor` or `aria-label`

### Issue: Button purpose unclear
**Solution**: Add descriptive `aria-label` or visible text

### Issue: Dynamic content not announced
**Solution**: Add `aria-live` region with appropriate politeness

### Issue: Modal not announced
**Solution**: Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`

### Issue: Table structure unclear
**Solution**: Add proper `<th>` elements and `scope` attributes

### Issue: Loading state not announced
**Solution**: Add `aria-live="polite"` and `aria-busy="true"`

## Accessibility Checklist

### Content
- [ ] All images have alt text
- [ ] Headings are in logical order (h1, h2, h3)
- [ ] Links have descriptive text
- [ ] No "click here" or "read more" links

### Forms
- [ ] All fields have labels
- [ ] Required fields are marked
- [ ] Error messages are descriptive
- [ ] Help text is associated with fields
- [ ] Form submission provides feedback

### Navigation
- [ ] Skip links are provided
- [ ] Keyboard navigation works
- [ ] Focus order is logical
- [ ] Current page is indicated

### Interactive Elements
- [ ] All buttons have accessible names
- [ ] Icon buttons have labels
- [ ] Toggle states are announced
- [ ] Disabled states are indicated

### Dynamic Content
- [ ] Loading states are announced
- [ ] Success messages are announced
- [ ] Error messages are announced
- [ ] Live regions are used appropriately

### Modals and Dialogs
- [ ] Modal opening is announced
- [ ] Focus is trapped in modal
- [ ] Modal has accessible name
- [ ] Close button is accessible
- [ ] Focus returns on close

## Resources

### Documentation
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Testing Tools
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)

### Screen Reader Commands
- [NVDA Keyboard Shortcuts](https://dequeuniversity.com/screenreaders/nvda-keyboard-shortcuts)
- [VoiceOver Commands](https://dequeuniversity.com/screenreaders/voiceover-keyboard-shortcuts)
- [JAWS Keyboard Shortcuts](https://dequeuniversity.com/screenreaders/jaws-keyboard-shortcuts)

## Continuous Testing

### Automated Testing
- Run axe DevTools on every page
- Use Lighthouse accessibility audit
- Integrate accessibility tests in CI/CD

### Manual Testing
- Test with keyboard only (no mouse)
- Test with screen reader weekly
- Test with different screen readers
- Test on mobile devices

### User Testing
- Include users with disabilities in testing
- Gather feedback on accessibility
- Iterate based on real user needs
- Document accessibility improvements

## Reporting Issues

When reporting accessibility issues, include:
1. Screen reader and version
2. Browser and version
3. Operating system
4. Steps to reproduce
5. Expected behavior
6. Actual behavior
7. Screenshots or recordings if applicable

## Future Improvements

- [ ] Add more ARIA live regions for real-time updates
- [ ] Implement skip navigation for complex pages
- [ ] Add keyboard shortcuts help dialog
- [ ] Improve table accessibility for complex data
- [ ] Add audio descriptions for video content
- [ ] Implement high contrast mode
- [ ] Add text-to-speech for long content
