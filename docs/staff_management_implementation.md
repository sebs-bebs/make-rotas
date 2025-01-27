# Staff Management Implementation Guide

## 1. Data Structures

### 1.1 Staff Member Object
```typescript
interface StaffMember {
  staffID: string;          // Unique identifier
  fullName: string;         // Required
  role: string;            // Optional
  comments: string;        // Optional
  availability: string[];  // Optional, array of day codes
  state: 'NEW' | 'SAVED' | 'EDITING';
}
```

### 1.2 Edit States
```typescript
interface EditState {
  editingStaffId: string | null;
  tempData: StaffMember | null;
  hasUnsavedChanges: boolean;
}
```

### 1.3 Validation State
```typescript
interface ValidationState {
  errors: {
    [key: string]: string;
  };
  dirtyFields: Set<string>;  // Fields that have been modified
  touchedFields: Set<string>; // Fields that have been interacted with
}
```

## 2. Validation Scenarios

### 2.1 Field-Specific Validation
```typescript
const ValidationRules = {
  fullName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[A-Za-z\s-']+$/,
    messages: {
      required: "Staff name is required",
      minLength: "Name must be at least 2 characters",
      maxLength: "Name cannot exceed 50 characters",
      pattern: "Name can only contain letters, spaces, hyphens, and apostrophes"
    }
  },
  
  role: {
    required: false,
    maxLength: 30,
    pattern: /^[A-Za-z\s-]+$/,
    messages: {
      maxLength: "Role cannot exceed 30 characters",
      pattern: "Role can only contain letters, spaces, and hyphens"
    }
  },
  
  comments: {
    required: false,
    maxLength: 100,
    messages: {
      maxLength: "Comments cannot exceed 100 characters"
    }
  },
  
  availability: {
    required: false,
    validate: (days: string[]) => {
      const validDays = days.every(day => WEEKDAYS.includes(day));
      const uniqueDays = new Set(days).size === days.length;
      return {
        isValid: validDays && uniqueDays,
        message: !validDays ? "Invalid day selection" : 
                !uniqueDays ? "Duplicate days selected" : ""
      };
    }
  }
}
```

### 2.2 Validation Timing
1. **On Field Change**
   - Validate field-specific rules
   - Update dirtyFields
   - Show inline validation feedback

2. **On Field Blur**
   - Add to touchedFields
   - Show validation messages if invalid

3. **On Save Attempt**
   - Validate all fields
   - Prevent save if invalid
   - Show all validation messages

4. **On Add New Staff**
   - Validate required fields
   - Show validation before allowing add

## 3. Notification Integration

### 3.1 Notification Types
```typescript
enum NotificationType {
  UNSAVED_CHANGES = 'unsaved_changes',
  VALIDATION_ERROR = 'validation_error',
  SUCCESS = 'success',
  WARNING = 'warning'
}

interface NotificationConfig {
  type: NotificationType;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

interface NotificationAction {
  label: string;
  onClick: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}
```

### 3.2 Notification Scenarios

1. **Unsaved Changes**
```typescript
const unsavedChangesNotification: NotificationConfig = {
  type: NotificationType.WARNING,
  message: `You have unsaved changes for ${staffName}`,
  duration: 0, // Persist until action taken
  actions: [
    {
      label: 'Save Changes',
      onClick: handleSaveChanges,
      style: 'primary'
    },
    {
      label: 'Discard',
      onClick: handleDiscardChanges,
      style: 'danger'
    },
    {
      label: 'Continue Editing',
      onClick: handleContinueEditing,
      style: 'secondary'
    }
  ]
}
```

2. **Validation Errors**
```typescript
const validationErrorNotification: NotificationConfig = {
  type: NotificationType.VALIDATION_ERROR,
  message: 'Please correct the highlighted fields',
  duration: 5000,
  actions: [
    {
      label: 'View Errors',
      onClick: scrollToFirstError,
      style: 'primary'
    }
  ]
}
```

3. **Success Messages**
```typescript
const successNotification: NotificationConfig = {
  type: NotificationType.SUCCESS,
  message: 'Staff member updated successfully',
  duration: 3000
}
```

## 4. Edge Cases

### 4.1 Multiple Interaction Prevention
```typescript
interface InteractionState {
  isEditing: boolean;
  editingStaffId: string | null;
  preventNewStaff: boolean;
  preventOtherEdits: boolean;
}

const handleInteraction = (staffId: string, action: 'edit' | 'add' | 'remove') => {
  if (isEditing && editingStaffId !== staffId) {
    showUnsavedChangesNotification();
    return false;
  }
  return true;
}
```

### 4.2 Data Loss Prevention
1. **Browser Tab Close**
```typescript
window.addEventListener('beforeunload', (event) => {
  if (hasUnsavedChanges) {
    event.preventDefault();
    return event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
  }
});
```

2. **Route Change**
```typescript
const handleRouteChange = (nextRoute) => {
  if (hasUnsavedChanges) {
    showUnsavedChangesModal({
      onConfirm: () => navigate(nextRoute),
      onCancel: () => void
    });
    return false;
  }
  return true;
}
```

### 4.3 Concurrent Edit Prevention
1. **Row Level Locking**
```typescript
interface RowLockState {
  lockedBy: string | null;  // staffId
  lockedAt: Date | null;
  lockDuration: number;     // milliseconds
}

const acquireLock = (staffId: string): boolean => {
  if (isLocked && lockedBy !== staffId) {
    showNotification({
      message: 'Another edit is in progress',
      type: 'warning'
    });
    return false;
  }
  return true;
}
```

2. **Auto-save During Long Edits**
```typescript
interface AutoSaveConfig {
  enabled: boolean;
  interval: number;  // milliseconds
  minChanges: number;
}

const setupAutoSave = (staffId: string) => {
  let changeCount = 0;
  
  const autoSaveInterval = setInterval(() => {
    if (changeCount >= minChanges) {
      saveChanges(staffId, true);  // true = isAutoSave
      changeCount = 0;
    }
  }, interval);

  return () => clearInterval(autoSaveInterval);
}
```

## 5. Implementation Order

### Phase 1: Basic Structure
1. Create constants.js with day names
2. Create base StaffMember interface
3. Update StaffDetailContext with new fields
4. Add validation rules

### Phase 2: UI Components
1. Create Availability component with toggle buttons
2. Update StaffList row with edit/save buttons
3. Add validation feedback UI
4. Implement basic notification component

### Phase 3: Edit Functionality
1. Add edit state management
2. Implement inline editing
3. Add save/cancel functionality
4. Implement validation

### Phase 4: Safety Features
1. Add unsaved changes detection
2. Implement edit prevention logic
3. Add route change protection
4. Implement auto-save

### Phase 5: Polish
1. Add loading states
2. Improve error messages
3. Add keyboard navigation
4. Optimize performance

## 6. Testing Strategy

### 6.1 Unit Tests
1. Validation rules
2. State transitions
3. Data transformations
4. UI component rendering

### 6.2 Integration Tests
1. Edit flow
2. Validation flow
3. Notification system
4. Auto-save functionality

### 6.3 Edge Case Tests
1. Concurrent edits
2. Browser navigation
3. Network failures
4. Invalid data handling
