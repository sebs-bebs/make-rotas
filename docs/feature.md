# Feature Documentation

## Tab Navigation Component

### Overview
The tab navigation component is a reusable React component that provides a simple horizontal tab interface. It's built using React and styled with TailwindCSS.

### Implementation Details

#### Component Structure
```jsx
// TabNavigation.js
- Uses React.useState for managing active tab state
- Implements a flex container for horizontal layout
- Uses conditional styling for active/inactive states
```

#### Key Features
1. **State Management**
   - Uses React's useState hook to track the active tab
   - Initial state set to "Tab 1"

2. **Styling**
   - Responsive design with `sm:` breakpoint utilities
   - Full width container with `w-full`
   - Consistent height with `h-12`
   - Bottom border using `border-b border-gray-200`
   - Padding adjustments for different screen sizes (`sm:px-6`)

3. **Tab Styling**
   - Active tab: Bold text (`font-bold`) and blue color (`text-blue-500`)
   - Clickable tabs with `cursor-pointer`
   - Consistent padding with `px-4 py-2`
   - Flex layout for content alignment

### State Management
The component maintains a single state variable:

- **activeTab**
  - Type: String
  - Initial Value: "Tab 1"
  - Possible Values: "Tab 1" or "Tab 2"
  - Updated via: setActiveTab function
  - Purpose: Controls which tab is currently selected and determines the visual styling

The state is used to:
- Track the currently selected tab
- Apply conditional styling (font-bold and text-blue-500) to the active tab
- Provide visual feedback in the UI

Note: Currently, this is a simple implementation where the state only tracks tab selection. It doesn't store any content or data associated with the tabs.

### Variables and Functions Reference

#### Component-Level Variables
```javascript
const [activeTab, setActiveTab] = React.useState("Tab 1")
```

#### State Update Functions
- **setActiveTab**
  - Type: Function
  - Parameters: String
  - Purpose: Updates activeTab state
  - Called by: Tab click handlers

#### Event Handlers
- **Tab Click Handler**
  - Type: Inline arrow function
  - Trigger: onClick
  - Action: Updates activeTab state
  - Example: `() => setActiveTab("Tab 1")`

#### Debug Tips
1. Check activeTab value in React DevTools under TabNavigation
2. Monitor tab click events in browser console
3. Verify state updates are triggering re-renders
4. Check CSS classes application based on activeTab value

> ⚠️ **Note**: The Debug Display feature has been moved to [meta_features.md](./meta_features.md) as it is a development-only tool.

### Navigation Features

#### 1. Home Link
- Logo/text "Make Rotas" in navbar links to home page ('/')
- Uses React Router's `Link` component
- Includes hover effect (blue color)
- Smooth color transition animation

#### 2. Routing Setup
- BrowserRouter wraps the entire application
- Enables client-side routing
- Maintains UI state during navigation
- Prevents page reloads

### Integration
The component is integrated into the main application through `App.js` and rendered within the main content area.

### Usage
```jsx
import TabNavigation from './components/TabNavigation';

// Use in any component
<TabNavigation />
```

### Accessibility Considerations
- Interactive elements use semantic HTML
- Visual feedback for active states
- Consistent spacing and sizing for touch targets

## Debug System
**Added: 2025-01-25**

### Overview
A real-time variable tracking and debugging system that provides visibility into component state changes and application behavior. The system is designed to be modular, efficient, and developer-friendly.

### Architecture

#### 1. Context Layer (DebugContext.js)
```jsx
// State Management
const [debugVariables, setDebugVariables] = useState({});

// Update Logic
const updateDebugVariables = useCallback((newVariables) => {
  setDebugVariables(prev => {
    const hasChanges = Object.entries(newVariables)
      .some(([componentName, componentVars]) => {
        return Object.entries(componentVars)
          .some(([varName, value]) => {
            const prevValue = prev[componentName]?.[varName]?.value;
            return prevValue !== value.value;
          });
      });

    if (!hasChanges) return prev;
    // ... update logic
  });
}, []);
```

**Key Features:**
- Optimized state updates using deep comparison
- Memoized update function to prevent unnecessary re-renders
- Maintains component hierarchy in state structure

#### 2. Display Layer (DebugDisplay.js)
```jsx
// Component Structure
<Modal>
  <SearchBar />
  <Controls />
  <ComponentList>
    <ComponentSection />
  </ComponentList>
</Modal>
```

**Implementation Details:**
- Modal uses React Portal for overlay rendering
- Search uses debounced input for performance
- Component sections use virtual scrolling for large datasets
- Maintains local state for UI preferences

#### 3. Data Flow
```
Component → useDebug Hook → Context → State Update → UI Update
```

**Update Cycle:**
1. Component calls `updateDebugVariables`
2. Context performs change detection
3. State updates if changes detected
4. UI components re-render with new data

### Technical Specifications

#### 1. Performance Optimizations

**State Management:**
```javascript
// Efficient deep comparison
const hasChanges = (prev, next) => {
  return JSON.stringify(prev?.value) !== JSON.stringify(next?.value);
};

// Batched updates
const batchedUpdate = updates.reduce((acc, update) => {
  if (hasChanges(acc[update.key], update.value)) {
    acc[update.key] = update.value;
  }
  return acc;
}, {});
```

**Render Optimization:**
- Uses React.memo for component memoization
- Implements shouldComponentUpdate checks
- Utilizes useCallback for event handlers
- Employs useMemo for expensive computations

#### 2. Memory Management

**Variable Cleanup:**
```javascript
// Automatic cleanup on component unmount
useEffect(() => {
  return () => {
    updateDebugVariables({
      [componentName]: undefined
    });
  };
}, []);
```

**Memory Considerations:**
- Limits debug history to prevent memory leaks
- Implements cleanup on component unmount
- Uses weak references for certain debug data

#### 3. Type System

**Debug Variable Structure:**
```typescript
interface DebugVariable {
  value: any;
  lastUpdated: string;
  type: string;
  metadata?: {
    source: string;
    updateCount: number;
    initialValue: any;
  };
}

interface ComponentDebugData {
  [variableName: string]: DebugVariable;
}

interface DebugState {
  [componentName: string]: ComponentDebugData;
}
```

#### 4. Event System

**Debug Events:**
```javascript
// Event types
const DEBUG_EVENTS = {
  VARIABLE_UPDATE: 'debug:variable:update',
  COMPONENT_MOUNT: 'debug:component:mount',
  COMPONENT_UNMOUNT: 'debug:component:unmount',
  SEARCH_FILTER: 'debug:ui:search',
  SECTION_TOGGLE: 'debug:ui:section:toggle'
};

// Event handling
const handleDebugEvent = (event) => {
  switch (event.type) {
    case DEBUG_EVENTS.VARIABLE_UPDATE:
      updateDebugVariables(event.data);
      break;
    // ... other event handlers
  }
};
```

#### 5. Search Implementation

**Search Algorithm:**
```javascript
const searchVariables = (variables, term) => {
  const searchTerm = term.toLowerCase();
  return Object.entries(variables).filter(([key, data]) => {
    return (
      key.toLowerCase().includes(searchTerm) ||
      JSON.stringify(data.value).toLowerCase().includes(searchTerm) ||
      data.type.toLowerCase().includes(searchTerm)
    );
  });
};
```

**Search Optimizations:**
- Debounced input handling
- Memoized search results
- Progressive loading for large datasets

#### 6. UI Component Architecture

**Component Hierarchy:**
```
DebugProvider
└── DebugDisplay
    ├── SearchBar
    ├── ControlPanel
    └── ComponentList
        └── ComponentSection
            ├── Header
            │   ├── Title
            │   └── Timestamp
            └── Content
                └── VariableList
```

**Styling System:**
- Uses Tailwind CSS for responsive design
- Implements dark mode by default
- Maintains consistent spacing scale
- Uses CSS Grid for layout management

### Advanced Implementation Details

#### 1. Virtual Scrolling Implementation
```jsx
const VirtualizedComponentList = ({ components, itemHeight = 50 }) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;
    
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      components.length,
      Math.ceil((scrollTop + viewportHeight) / itemHeight)
    );
    
    setVisibleRange({ start, end });
  }, [itemHeight, components.length]);

  const visibleComponents = useMemo(() => {
    return components.slice(visibleRange.start, visibleRange.end);
  }, [components, visibleRange]);

  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ height: '400px' }}
      onScroll={handleScroll}
    >
      <div style={{ height: `${components.length * itemHeight}px` }}>
        <div
          style={{
            transform: `translateY(${visibleRange.start * itemHeight}px)`
          }}
        >
          {visibleComponents.map(component => (
            <ComponentSection
              key={component.name}
              {...component}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

#### 2. Debounced Search Implementation
```jsx
const useDebounceSearch = (initialValue = '') => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);
  
  return {
    searchTerm,
    debouncedTerm,
    handleSearchChange
  };
};

// Usage in DebugDisplay
const SearchBar = () => {
  const {
    searchTerm,
    debouncedTerm,
    handleSearchChange
  } = useDebounceSearch();

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={handleSearchChange}
      className="search-input"
      placeholder="Search variables..."
    />
  );
};
```

#### 3. Advanced Variable Tracking
```jsx
// Custom hook for complex state tracking
const useDebugTracker = (componentName, initialState) => {
  const { updateDebugVariables } = useDebug();
  const updateCountRef = useRef({});
  const initialValueRef = useRef({});
  
  // Initialize tracking metadata
  useEffect(() => {
    Object.keys(initialState).forEach(key => {
      updateCountRef.current[key] = 0;
      initialValueRef.current[key] = initialState[key];
    });
  }, []);
  
  const trackVariable = useCallback((key, value) => {
    updateCountRef.current[key] = (updateCountRef.current[key] || 0) + 1;
    
    updateDebugVariables({
      [componentName]: {
        [key]: {
          value,
          lastUpdated: new Date().toLocaleTimeString(),
          type: typeof value,
          metadata: {
            updateCount: updateCountRef.current[key],
            initialValue: initialValueRef.current[key],
            changes: JSON.stringify(value) !== JSON.stringify(initialValueRef.current[key])
          }
        }
      }
    });
  }, [componentName, updateDebugVariables]);
  
  return trackVariable;
};

// Usage Example
const ComplexComponent = () => {
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    preferences: {}
  });
  
  const trackVariable = useDebugTracker('ComplexComponent', formState);
  
  useEffect(() => {
    trackVariable('formState', formState);
  }, [formState, trackVariable]);
};
```

#### 4. Component Section Animation
```jsx
const AnimatedComponentSection = ({ isOpen, children }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  
  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(isOpen ? contentHeight : 0);
    }
  }, [isOpen]);
  
  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ height }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

// Usage in ComponentSection
const ComponentSection = ({ componentName, variables, isOpen, onToggle }) => {
  return (
    <div className="border-b border-green-400/20">
      <button
        onClick={onToggle}
        className="flex items-center w-full p-2"
      >
        <span className="transform transition-transform duration-200">
          {isOpen ? '▼' : '▶'}
        </span>
        <span className="ml-2">{componentName}</span>
      </button>
      
      <AnimatedComponentSection isOpen={isOpen}>
        <pre className="p-4 text-sm">
          {JSON.stringify(variables, null, 2)}
        </pre>
      </AnimatedComponentSection>
    </div>
  );
};
```

#### 5. Advanced State Diffing
```jsx
const getStateDiff = (prev, next) => {
  const changes = {};
  
  Object.keys({ ...prev, ...next }).forEach(key => {
    const prevValue = prev[key]?.value;
    const nextValue = next[key]?.value;
    
    if (JSON.stringify(prevValue) !== JSON.stringify(nextValue)) {
      changes[key] = {
        previous: prevValue,
        current: nextValue,
        type: typeof nextValue,
        timestamp: new Date().toLocaleTimeString()
      };
    }
  });
  
  return Object.keys(changes).length ? changes : null;
};

// Usage in debug context
const updateDebugVariables = useCallback((newVariables) => {
  setDebugVariables(prev => {
    const diff = getStateDiff(prev, newVariables);
    
    if (!diff) return prev;
    
    // Track state changes history
    setDebugHistory(history => [
      ...history,
      {
        timestamp: new Date().toLocaleTimeString(),
        changes: diff
      }
    ].slice(-50)); // Keep last 50 changes
    
    return {
      ...prev,
      ...newVariables
    };
  });
}, []);
```

#### 6. Keyboard Navigation
```jsx
const useKeyboardNavigation = (sections, activeSection, setActiveSection) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!sections.length) return;
      
      const currentIndex = sections.findIndex(s => s === activeSection);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < sections.length - 1) {
            setActiveSection(sections[currentIndex + 1]);
          }
          break;
          
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            setActiveSection(sections[currentIndex - 1]);
          }
          break;
          
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (activeSection) {
            toggleSection(activeSection);
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sections, activeSection, setActiveSection]);
};

// Usage in DebugDisplay
const DebugDisplay = () => {
  const [activeSection, setActiveSection] = useState(null);
  const sections = Object.keys(debugVariables);
  
  useKeyboardNavigation(sections, activeSection, setActiveSection);
  
  return (
    // ... component JSX
  );
};
```

### Error Handling

#### 1. Boundary Implementation
```jsx
class DebugErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Debug System Error:', error);
    // Fallback UI rendering
  }
}
```

#### 2. Error Types
```javascript
class DebugError extends Error {
  constructor(message, code, metadata) {
    super(message);
    this.code = code;
    this.metadata = metadata;
  }
}

// Example usage
throw new DebugError(
  'Invalid debug variable format',
  'DEBUG_001',
  { component: 'UserProfile', variable: 'userData' }
);
```

### Integration Guidelines

#### 1. Component Integration
```jsx
// High-level component integration
const YourComponent = () => {
  const { updateDebugVariables } = useDebug();
  
  // Batch multiple updates
  const batchedUpdate = useCallback(() => {
    updateDebugVariables({
      YourComponent: {
        // Group related variables
        userState: { /* ... */ },
        uiState: { /* ... */ },
        // Track derived values
        computedValues: { /* ... */ }
      }
    });
  }, [dependencies]);
};
```

#### 2. Best Practices
- Group related variables under meaningful names
- Use consistent naming conventions
- Implement cleanup on component unmount
- Batch updates when possible
- Add meaningful metadata to debug variables

### Related Documentation
- [Debug System README](../src/components/Debug/README.md)
- [Example Components](../src/components/Debug/examples/)
