# Debug View Section Ordering Documentation

## Overview
This document explains the dynamic ordering behavior of collapsible sections within the Debug View component. The ordering is influenced by JavaScript's object property handling and React's component lifecycle.

## Section Order Behavior

### Initial Page Load Order
When the page first loads, sections typically appear in this order:
```
1. StaffDetail (Active)
2. TabNavigation (Active)
3. StaffList (Inactive)
4. ShiftTable (Active)
```

### Post Tab Switch Order
After switching to Staff List tab, sections reorder to:
```
1. ShiftTable (Inactive)
2. StaffList (Active)
3. TabNavigation (Active)
4. StaffDetail (Active)
```

## Technical Implementation Details

### 1. Component Update Sequence
The order is primarily determined by when components call `updateDebugVariables`:

```javascript
// Update sequence in DebugContext
updateDebugVariables((newVariables) => {
  setDebugVariables(prev => {
    const nextState = { ...prev };
    Object.entries(newVariables).forEach(([componentName, componentVars]) => {
      nextState[componentName] = {
        ...nextState[componentName],
        ...componentVars
      };
    });
    return nextState;
  });
});
```

### 2. Factors Affecting Order

#### a. JavaScript Object Property Ordering
- JavaScript maintains insertion order for object properties (ES2015+)
- New properties are added at the end
- Updated properties maintain their position
- Object spread operations can affect ordering

#### b. Component Update Timing
```javascript
// TabNavigation updates debug variables on tab change
updateDebugVariables({
  TabNavigation: {
    activeComponents: {
      value: {
        ShiftTable: activeTab === "Tab 1",
        StaffList: activeTab === "Tab 2",
        TabNavigation: true,
        StaffDetail: true
      }
    }
  }
});
```

#### c. Debug Variables State Management
- Each component update creates or modifies entries in the debugVariables object
- The order of sections reflects the order of recent state updates
- Component mounting and unmounting affects update sequence

## Order Change Triggers

### 1. Initial Load
- StaffDetail initializes first (from context)
- TabNavigation mounts and updates
- Other components initialize as inactive/active based on default tab

### 2. Tab Switch
1. Previous active component becomes inactive
2. New component becomes active
3. TabNavigation updates its state
4. Unchanged components maintain their state

## Implementation Notes

### Debug Display Rendering
```javascript
// DebugDisplay.js
const filteredComponents = useMemo(() => {
  // Components are rendered based on their order in debugVariables
  return validComponents
    .filter(componentName => {
      // Filter logic
    })
    .map(componentName => [
      componentName, 
      debugVariables[componentName] || {}
    ]);
}, [debugVariables, searchTerm]);
```

### Current Behavior Preservation
- The current implementation maintains this dynamic ordering
- Order reflects the most recent state updates
- This provides a visual cue of recent component activity
- No explicit sorting is applied to maintain natural update flow

## Important Considerations

1. **State Updates**
   - Each component update can potentially affect section order
   - Order changes reflect actual component update sequence

2. **Performance**
   - Dynamic ordering has minimal performance impact
   - Uses JavaScript's native object property handling

3. **Debugging Benefits**
   - Order changes can help track component update sequence
   - Recently updated components move to the top
   - Helps visualize application state changes

4. **Maintainability**
   - Order is deterministic based on update sequence
   - No additional sorting logic required
   - Behavior is consistent with JavaScript's object property handling
