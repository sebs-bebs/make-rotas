# Debug View Test Scenarios

## 1. First-Time User Experience
### Expected Behavior
```
▶ StaffDetail (Active)      // Always active
▶ TabNavigation (Active)    // Always active
▶ StaffList (Inactive)      // Inactive by default
▶ ShiftTable (Active)       // Active because it's the default first tab
```

### Verification Steps
1. Clear localStorage
2. Refresh page
3. Check component states
4. Verify debug storage initialization

## 2. Tab Switching
### Expected Behavior
When switching to StaffList:
```
▶ StaffDetail (Active)      // Remains active
▶ TabNavigation (Active)    // Remains active
▶ StaffList (Active)        // Becomes active
▶ ShiftTable (Inactive)     // Becomes inactive
```

### Verification Steps
1. Click StaffList tab
2. Check component states update
3. Verify localStorage updates
4. Check timestamps are current

## 3. State Persistence
### Expected Behavior
After refresh with StaffList active:
```
▶ StaffDetail (Active)      // Still active
▶ TabNavigation (Active)    // Still active
▶ StaffList (Active)        // Remains active
▶ ShiftTable (Inactive)     // Remains inactive
```

### Verification Steps
1. Refresh page
2. Verify active tab persists
3. Check component states remain
4. Validate debug storage data
