# Staff to Rota Feature Documentation

## Overview
This document tracks the requirements and implementation details for the Staff-to-Rota feature. This feature allows users to add staff members to a rota by selecting them from a staff list.

## Important Implementation Note
This feature is for the ShiftTable.js component, NOT StaffList.js. No changes should be made to StaffList.js for this feature.

## Core Requirements
- Add button will be shown on a new row at the end of all other rows in ShiftTable
- Clicking Add button will open a popup sheet with staff list
- Users will be able to select multiple staff members at once from this list to add to the rota
- The popup sheet will only display staff members who haven't already been added to the current rota
- An "Add Selected" button will allow users to confirm their selection and add staff to the rota
- The staff selection interface will include search/filter capabilities for easier staff discovery
- All implementations must preserve crucial state variables and existing data structures

## Interaction Flow
1. User sees Add button on a new row at the end of the rota in ShiftTable
2. User clicks Add button
3. A popup sheet appears showing available staff members (excluding those already on the rota)
4. User can search/filter the staff list to find specific staff members
5. User selects one or multiple staff members to add
6. User clicks "Add Selected" button to confirm their choices
7. Selected staff members are added to the rota
8. A notification message appears briefly confirming the number of staff added
9. Popup automatically closes after staff are added
10. Staff members added to the rota are removed from the available list in the popup
11. The Add Staff button is disabled with a tooltip when no more staff are available to add

## State Management
- All interactions must be tracked through the Debug system for troubleshooting
- Staff-to-rota assignments will be persisted in local storage like other data in the application
- If there are conflicts with data across tabs, existing data in local storage takes priority
- The implementation will maintain compatibility with existing state management
- No crucial variables or data structures will be modified in ways that could break existing functionality

## Implementation Details

### Components Created

#### 1. AddStaffButton.js
- Simple button component that appears at the end of the ShiftTable
- Tracks button clicks in the Debug system
- Calls the provided onClick handler when clicked
- Supports disabled state for when no staff are available to add
- Tracks disabled state in Debug system

#### 2. StaffSelector.js
- Popup component for selecting staff to add to the rota
- Includes a search box for filtering staff members
- Shows checkboxes for multiple staff selection
- Provides "Add Selected" and "Close" buttons
- Tracks all interactions in the Debug system
- Only displays staff that haven't already been added to the rota
- Retrieves staff data from StaffDetailContext
- Only shows staff with inList=true property

#### 3. ShiftTable.js (Modified)
- Added a new row at the end of the table containing the AddStaffButton
- Implemented state management for the staff selector popup
- Added localStorage persistence for rows and staff IDs
- Ensures proper tracking in the Debug system
- Added handlers for adding selected staff to the rota
- Updates UI to show newly added staff immediately
- Auto-closes popup after staff are added
- Shows a temporary notification with the number of staff added
- Disables the Add Staff button when no more staff are available
- Adds tooltip to disabled button explaining why it's disabled
- Tracks availability of staff in Debug system

### Local Storage Implementation
- The feature uses two localStorage keys:
  - `shiftTableRows`: Stores the entire table structure
  - `shiftTableStaffIDs`: Tracks which staff IDs are assigned to which rows
- Both are updated whenever the respective state changes
- On component initialization, data is loaded from localStorage if available

### Debug Integration
- All key actions are tracked in the Debug system:
  - Button clicks
  - Button disabled state
  - Popup opening/closing
  - Staff selection
  - Staff addition to the rota
  - Current state of staff IDs and rows
  - Availability of staff to add
  - Notification messages

### User Experience Improvements
- Notification message appears briefly after adding staff
- Add Staff button is disabled when no staff are available
- Hovering over disabled button shows tooltip: "All staff members have been added"
- Popup automatically closes after adding staff
- Staff selector shows staff roles in addition to names
- Filter helps find staff quickly in larger organizations
