Okay, let's map the data flow in this React application. We'll focus on the main components and contexts, tracing how data is created, modified, and passed around.

Core Data Entities:

Staff Member: Represents an individual staff member with properties like staffID, fullName, role, comments, availability, inList and state.

Shift Data: (Currently rudimentary) Represents shifts in the ShiftTable.

Debug Variables: A dynamic collection of component-specific states.

Key Data Flows:

1. Initial App Load:

index.js: The entry point renders the App component.

App.js:

Wraps the entire app with BrowserRouter for routing.

Provides the DebugProvider, DateProvider, StaffProvider, and StaffDetailProvider contexts.

Renders the Navbar and TabNavigation.

Renders the DebugDisplay.

StaffDetailProvider (context):

On mount (useEffect), it attempts to load staff data from localStorage using the loadStaffListData function from src/utils/storage.js.

If data is loaded successfully:

setStaffMembers to populate staff data.

Sets the editingStaffId

Sets a loading state (isLoading).

StaffList Component

Reads the data in StaffDetailContext and renders staff rows using setRows

Initializes all the mapping states based on the available data.

DateProvider (context):

Initializes currentDate to the current date.

Provides getCurrentMonday, getMondayOfWeek, and getWeekDates for date calculations

DebugProvider (context):

Initializes the debug state to {}.

2. User Interactions (Staff List):

StaffList.js:

Input Changes:

handleInputChange: Updates inputValues for the staff name field.

handleRoleChange: Updates roleValues for the role field.

handleCommentChange: Updates commentValues for the comments field.

handleAvailabilityChange:

Updates availabilityValues for staff availability.

Also calls updateStaffAvailability in StaffDetailContext to save the change to context.

Add Button Click (handleAddClick):

Generates a unique staffID using generateStaffID in src/utils/staffData.js.

Creates new StaffMember object using current input values.

Calls addStaffMember in StaffDetailContext to add the new staff member.

Updates rowStaffIDs, rows, inputValues, roleValues commentValues state to add the new entry.

Calls updateDebugVariables in DebugContext to reflect the change.

Remove Button Click (handleRemoveClick):

Gets staffID for selected row.

Calls removeStaffMember in StaffDetailContext to soft delete staff member.

Removes the row using setRows

Updates rowStaffIDs, inputValues, roleValues, commentValues and availabilityValues to delete old row mappings.

Calls updateStaffNumber in StaffContext to reflect change in staff count.

Calls updateDebugVariables in DebugContext to reflect the change.

Edit Button Click (handleEditClick):

Calls setEditingRow to track currently editing row.

Calls setEditingValues to initialise the form with data to be edited.

Save Button Click(handleSaveClick):

Updates all the input fields using setInputValues, setRoleValues, setCommentValues, setAvailabilityValues

Calls updateStaffMember in StaffDetailContext to save the change to context.

Calls updateDebugVariables in DebugContext to reflect the change.

Calls setEditingRow(null) and setEditingValues({}) to clear the form

Cancel Button Click (handleCancelEdit):

Calls setEditingRow(null) and setEditingValues({}) to clear the form

StaffDetailProvider (context):

addStaffMember:

Adds the new StaffMember to the staffMembers state array.

removeStaffMember:

Updates the inList property to false.

updateStaffMember:

Updates the staff member using the staffID to find and update the member in state

updateStaffAvailability:

Updates availability of staff member using the staffID to find and update the member in state

useEffect hook (runs when staffMembers or editingStaffId changes):

calls saveStaffListData to save the updated list to local storage.

also includes logic for tracking lastUpdated time.

A useEffect hook (runs when staffMembers changes):

Updates debug variables using updateDebugVariables to reflect changes.

3. User Interactions (Shift Table):

TabNavigation.js:

Handles switching between tabs using handleTabChange

Updates activeTab state

Saves activeTab to localStorage

Calls updateDebug to reflect tab changes in Debug view

Has a useEffect hook to run the updateDebug callback when activeTab changes

ShiftTable.js:

Week Navigation:

navigateWeek: Updates weekOffset state and fetches new dates based on direction using getMondayOfWeek in DateContext

goToCurrentWeek: Resets the week to current date with 0 offset using getCurrentMonday in DateContext

Updates debug information using updateDebugVariables on every render

DateProvider (context):

Provides methods to calculate dates and update the current date using the getMonday, getMondayOfWeek, and getWeekDates helper functions.

A useEffect hook is used to automatically update the current date at midnight.

4. Debug View (DebugDisplay.js):

DebugDisplay.js:

Fetches the isDebugVisible, debugVariables from DebugContext to render the debug view

Displays all active components that are in validComponents array

Renders ComponentSection for each visible component

Tracks search using searchTerm and filter variables.

Toggles the expanded sections.

Has an effect to update StaffDetail related debug variables based on staffMembers from StaffDetailContext.

DebugContext.js:

Manages the visibility of debug view, isDebugVisible via toggleDebug.

Holds the debugVariables state for all components being tracked.

The updateDebugVariables function performs a deep comparison before updating debug state

ComponentSection.js:

Receives the component data and conditionally displays information based on validComponents whitelist

Displays Active or Inactive tag based on whether the component is visible in TabNavigation.

5. Other Components

HistoryNotification.js

Displays a notification in bottom-left and auto-hides after a timeout

Notification.js

Displays a notification in the bottom right and can be dismissed by the user

UndoRedoBar.js

Conditionally renders undo/redo buttons at the bottom of the page

Only shown when undoCount or redoCount is greater than zero.

EditButton.js

Button component that toggles a staff member for edit using onEdit callback

RemoveButton.js

Button component that triggers staff removal via onRemove callback

6. storage.js
* Includes helper functions for loading/saving data to local storage
* saveStaffMember: Saves a single staff member's data.
* loadStaffMember: Loads a single staff member's data based on staffId.
* loadAllStaffMembers: Loads all staff members and returns them as an array.
* removeStaffMember: Removes a staff member's data from localStorage.
* hasEnoughStorage to check available space before writing
* saveWithRetry: handles write errors with retry.
* saveStaffListData: Saves the list of staff (metadata) to localStorage, including schema version.
* loadStaffListData: Loads the list of staff and the schema version, and performs migrations if needed

7. utils/staffChangeTracker.js

Includes helper functions for tracking changes in staff records

hasActualChanges: compares two staff records to see if any meaningful changes have occurred

createChangeDescription: Creates a summary of changes that occured

createChangeRecord: Creates a history entry using timestamp and changes

8. utils/staffConstants.js
* Includes various constants and types for staff management

9. utils/staffValidation.js
* Includes validation methods for different staff fields
* validateStaffName: Validates that staff name has only letters and spaces and has length greater than MIN_NAME_LENGTH and lesser than MAX_NAME_LENGTH.
*validateStaffRole: Checks for required role
* validateAvailability: Checks for minimal number of availability days selected
* validateStaffMember: validates all the above three

Mermaid Diagram (Simplified High-Level Data Flow):

graph TD
    A[Initial Load] --> B(StaffDetailProvider);
    B --> C{localStorage};
    C --> D[StaffList];
    D --> E{UI};
    E --> F(UserInput);
    F --> G[StaffList\n(State Update)];
    G --> H(StaffDetailContext);
    H --> C;
     H --> J[DebugContext];
    J --> I(DebugDisplay);
     E --> I;
     A --> K(DateProvider)
     K --> L[ShiftTable]
     L --> I
     A --> M(DebugProvider)
    M --> J

   style A fill:#f9f,stroke:#333,stroke-width:2px
   style J fill:#ccf,stroke:#333,stroke-width:2px
   style H fill:#ccf,stroke:#333,stroke-width:2px
   style L fill:#ccf,stroke:#333,stroke-width:2px
content_copy
download
Use code with caution.
Mermaid

Summary of Key Data Points:

StaffDetailContext: The central hub for staff data, fetching it from localStorage and handling updates, saves, and loads.

StaffList.js: Uses StaffDetailContext to display and update staff details and directly interacts with UI.

TabNavigation.js: Manages Tab switching and updates states and debug data accordingly.

ShiftTable.js: Primarily uses DateContext to calculate and update week data and provides debug data.

DebugContext: Tracks variable changes across the application to debug

localStorage: Used as a single source of truth for all stateful data including staff, debug, and navigation state.

Key Points:

Context-Driven: The application heavily relies on React Context for managing shared state and data.

localStorage Integration: Data persistence is achieved primarily through localStorage.

Dynamic Updates: Debug information is updated dynamically using useDebug and updateDebugVariables.

Clear Separation: Each component generally handles its rendering and interaction logic. Core logic is often found in contexts or separate util functions.

Centralized State: Most data lives in the StaffDetailContext, DebugContext, and DateContext, making it available to all components in the tree.

This data flow map provides a clear picture of the app's architecture and how information moves between components and services. It should be a good base to understand the code better. Let me know if you have any further questions!