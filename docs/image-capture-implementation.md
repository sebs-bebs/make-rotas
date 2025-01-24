# Rota Table Image Capture Implementation

## Overview
This document outlines the challenges faced and solutions implemented for capturing the rota table as an image using `html2canvas`.

## Initial Approach and Issues

### 1. Direct Table Capture
**Issue**: Initial attempt to capture the table directly with `html2canvas` included unwanted UI elements.
- Search bar was visible
- Year display was included
- Extra white space on the right
- UI controls (buttons, selects) were visible

**Solution**: Created a clean clone of the table with only necessary content.

### 2. Cloning and CSS Approach
**Issue**: Cloning the table and using CSS to hide elements:
- Complex CSS selectors needed
- Some elements still showed up
- Inconsistent styling
- Table structure was affected

**Solution**: Abandoned CSS-based hiding in favor of building a new table.

### 3. SVG-Based Approach
**Issue**: Attempted to use SVG to wrap the table:
- Inconsistent rendering across browsers
- Complex implementation
- Staff names were missing
- Sizing issues

**Solution**: Reverted to direct HTML approach without SVG.

## Final Implementation

### Core Strategy
1. Create a new table from scratch instead of cloning
2. Copy only text content, ignoring HTML structure
3. Apply styles directly to cells using inline styles
4. Handle special cases for different cell types

### Special Handling

#### Staff Names Column
```javascript
if (cellIndex === 0 && cell.tagName === 'TD') {
  const staffName = cell.textContent.replace('OFF', '').trim();
  newCell.textContent = staffName;
}
```
- Left-aligned text
- Removed 'OFF' text artifacts
- Fixed width of 150px
- Normal font weight

#### Checkbox Cells
```javascript
if (cell.querySelector('input[type="checkbox"]')) {
  newCell.textContent = cell.querySelector('input[type="checkbox"]').checked ? 'OFF' : '';
}
```
- Convert checkboxes to text
- Show 'OFF' for checked state
- Empty for unchecked state

#### Select Elements
```javascript
if (cell.querySelector('select')) {
  const select = cell.querySelector('select');
  newCell.textContent = select.value || '';
}
```
- Extract only the selected value
- Handle empty states

### Styling Improvements
- Fixed column widths (150px first column, 120px others)
- Consistent borders and padding
- Clean white background
- Proper text alignment per column type
- High-resolution output (2x scale)

## Key Learnings

1. **Direct DOM Manipulation**
   - Building a new structure is cleaner than modifying existing
   - Inline styles are more reliable for capture
   - Minimal DOM structure produces better results

2. **Content Handling**
   - Text-only approach is more reliable
   - Special cases need explicit handling
   - Clean up text content before display

3. **Performance**
   - Minimal DOM structure improves capture speed
   - No need for complex CSS selectors
   - Reduced memory usage without cloning

## Future Improvements

1. **Customization Options**
   - Allow configurable column widths
   - Support custom styling options
   - Enable format selection (PNG/JPEG)

2. **Error Handling**
   - Add retry mechanism for failed captures
   - Better error messages
   - Fallback options

3. **Performance**
   - Cache generated tables for repeated captures
   - Optimize for large tables
   - Progressive loading for big datasets
