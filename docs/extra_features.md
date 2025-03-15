# Future Features for Make-Rotas

## Week-Specific Staff Indicators

### Description
Add visual indicators to show how many staff members are assigned to each week. This would help users quickly identify weeks that are potentially understaffed or overstaffed.

### Implementation Details
1. **Week Navigation Component Enhancement**
   - Add staff count badge next to each week in the week selector
   - Use color coding to indicate staffing levels (e.g., red for understaffed, green for well-staffed)

2. **Summary Panel**
   - Add a summary panel that shows staffing statistics for the current week
   - Include metrics like total staff, total shifts assigned, and coverage percentage

3. **Calendar View Enhancement** 
   - When viewing the month calendar, add indicators showing staff count for each week
   - Allow clicking on these indicators to quickly jump to that week

### Technical Approach
- Leverage the existing `shiftTableStaffByWeek` structure in localStorage
- Create a new component for displaying staff statistics
- Implement a centralized method to calculate staffing levels across weeks

### Priority
Medium - This feature would improve usability but isn't critical for the core functionality of staff assignment and shift management.

## Empty Week Handling

### Description
Improve the user experience when navigating to weeks with no staff assigned by showing helpful guidance and quick-action buttons.

### Implementation Details
1. **Empty State Component**
   - Create a dedicated component for empty weeks
   - Show a friendly message explaining that no staff are assigned
   - Provide quick buttons for common actions (add staff, copy from another week)

2. **First-time User Guidance**
   - For new users with no data, provide a step-by-step guide
   - Add tooltips to highlight key features for empty state management

3. **Week Templates**
   - Allow saving and loading week templates
   - Enable quick staff assignment based on predefined patterns

### Technical Approach
- Add detection for empty weeks using the `staffByWeek` object
- Implement conditional rendering for empty state components
- Create helper utilities for copying staff between weeks

### Priority
High - This would significantly improve the user experience, especially for new users or when setting up schedules for new time periods.
