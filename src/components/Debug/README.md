# Debug System Documentation

## Overview
The Debug system is a modular, real-time variable tracking system for React components. It provides a centralized way to monitor state changes, track variable updates, and debug component behavior through a clean, interactive UI.

## Features
- 🔍 Real-time variable tracking
- 📊 Component-based organization
- 🕒 Automatic timestamp tracking
- 🔎 Search functionality
- 📂 Collapsible sections
- 🎯 Variable type tracking

## Installation
The Debug system is pre-installed in the components directory. No additional installation is required.

## Basic Usage

### 1. Wrap Your App
```jsx
import { DebugProvider, DebugDisplay } from './components/Debug';

function App() {
  return (
    <DebugProvider>
      <YourApp />
      <DebugDisplay />
    </DebugProvider>
  );
}
```

### 2. Use in Components
```jsx
import { useDebug } from './components/Debug';

function YourComponent() {
  const [someState, setSomeState] = useState('initial');
  const { updateDebugVariables } = useDebug();

  // Track state changes
  useEffect(() => {
    updateDebugVariables({
      YourComponent: {
        someState: {
          value: someState,
          lastUpdated: new Date().toLocaleTimeString(),
          type: typeof someState
        }
      }
    });
  }, [someState, updateDebugVariables]);

  return <div>{/* Your component content */}</div>;
}
```

## Best Practices

### 1. Component Naming
Use consistent component names for debugging:
```jsx
updateDebugVariables({
  // ✅ Good: Clear component name
  UserProfile: {
    userData: { /* ... */ }
  },
  // ❌ Bad: Unclear or inconsistent naming
  "user-data": { /* ... */ }
});
```

### 2. Variable Organization
Group related variables logically:
```jsx
updateDebugVariables({
  FormComponent: {
    formState: {
      value: { isValid, isDirty, touched },
      lastUpdated: new Date().toLocaleTimeString(),
      type: 'object'
    },
    validation: {
      value: { errors, warnings },
      lastUpdated: new Date().toLocaleTimeString(),
      type: 'object'
    }
  }
});
```

### 3. Memoization
Use memoization to prevent unnecessary updates:
```jsx
const updateDebug = useCallback(() => {
  updateDebugVariables({
    ComponentName: {
      variable: {
        value: value,
        lastUpdated: new Date().toLocaleTimeString(),
        type: typeof value
      }
    }
  });
}, [value, updateDebugVariables]);

useEffect(() => {
  updateDebug();
}, [updateDebug]);
```

## Advanced Usage

### 1. Tracking Multiple States
```jsx
function ComplexComponent() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({});
  const [errors, setErrors] = useState([]);
  const { updateDebugVariables } = useDebug();

  const updateDebug = useCallback(() => {
    updateDebugVariables({
      ComplexComponent: {
        user: {
          value: user,
          lastUpdated: new Date().toLocaleTimeString(),
          type: typeof user
        },
        settings: {
          value: settings,
          lastUpdated: new Date().toLocaleTimeString(),
          type: typeof settings
        },
        errors: {
          value: errors,
          lastUpdated: new Date().toLocaleTimeString(),
          type: Array.isArray(errors) ? 'array' : typeof errors
        }
      }
    });
  }, [user, settings, errors, updateDebugVariables]);

  useEffect(() => {
    updateDebug();
  }, [updateDebug]);
}
```

### 2. Conditional Debugging
```jsx
function ConditionalComponent() {
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);
  const { updateDebugVariables } = useDebug();

  const updateDebug = useCallback((debugData) => {
    if (!isDebugEnabled) return;
    
    updateDebugVariables({
      ConditionalComponent: {
        ...debugData
      }
    });
  }, [isDebugEnabled, updateDebugVariables]);
}
```

### 3. Custom Debug Formatters
```jsx
const formatDebugValue = (value) => {
  if (value instanceof Date) {
    return {
      value: value.toISOString(),
      type: 'date',
      lastUpdated: new Date().toLocaleTimeString()
    };
  }
  
  return {
    value: value,
    type: typeof value,
    lastUpdated: new Date().toLocaleTimeString()
  };
};

function FormattedComponent() {
  const [date, setDate] = useState(new Date());
  const { updateDebugVariables } = useDebug();

  useEffect(() => {
    updateDebugVariables({
      FormattedComponent: {
        date: formatDebugValue(date)
      }
    });
  }, [date, updateDebugVariables]);
}
```

## UI Features

### 1. Search
- Use the search bar to filter variables by name or value
- Searches are case-insensitive
- Matches both component names and variable contents

### 2. Collapse/Expand
- Click component headers to toggle sections
- Use "Collapse All" / "Expand All" to manage all sections
- State persists while debug modal is open

### 3. Timestamps
- Each variable shows its last update time
- Components show their most recent update
- Times are in local 24-hour format

## Troubleshooting

### Common Issues

1. **Variables not updating:**
   - Check that you're using the latest value in the dependency array
   - Verify that the value has actually changed
   - Ensure proper memoization with useCallback

2. **Missing timestamps:**
   - Always include lastUpdated in your debug objects
   - Use new Date().toLocaleTimeString() for consistency

3. **Performance issues:**
   - Memoize your update functions
   - Only track essential variables
   - Use conditional debugging for expensive operations
