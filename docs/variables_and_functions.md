# Variables and Functions Reference

## App Component (`src/App.js`)

### Imports
```javascript
import logo from './logo.svg'
import './App.css'
import Navbar from './components/Navbar'
import TabNavigation from './components/TabNavigation'
```

### Component Structure
- Type: Function Component
- Name: App
- Return: JSX with main layout structure

## Navbar Component (`src/components/Navbar.js`)

### Component Structure
- Type: Arrow Function Component
- Name: Navbar
- Return: Navigation bar with company name

## TabNavigation Component (`src/components/TabNavigation.js`)

### State Variables
```javascript
const [activeTab, setActiveTab] = React.useState("Tab 1")
```
- **activeTab**
  - Type: String
  - Default: "Tab 1"
  - Scope: Component-level state
  - Usage: Controls active tab selection

### State Update Functions
- **setActiveTab**
  - Type: Function
  - Parameters: String
  - Purpose: Updates activeTab state
  - Called by: Tab click handlers

### Event Handlers
- **Tab Click Handler**
  - Type: Inline arrow function
  - Trigger: onClick
  - Action: Updates activeTab state
  - Example: `() => setActiveTab("Tab 1")`

### Return Value
- Type: JSX
- Structure:
  ```jsx
  <div className="tab-navigation">
    <a> Tab 1 </a>
    <a> Tab 2 </a>
  </div>
  ```

## Debug Tips
1. Check activeTab value in React DevTools under TabNavigation
2. Monitor tab click events in browser console
3. Verify state updates are triggering re-renders
4. Check CSS classes application based on activeTab value

## Future Considerations
- Document any new state variables here
- Track side effects (useEffect hooks)
- List custom hooks when added
- Document context providers if implemented
- Track any Redux/global state integration
