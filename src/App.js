// This is the main app file that brings together all the parts of our application
// Think of it like the main blueprint that shows how everything connects

import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar';
import TabNavigation from './components/TabNavigation';
import { BrowserRouter as Router } from 'react-router-dom';
import { DebugProvider, DebugDisplay } from './components/Debug';
import { DateProvider } from './context/DateContext';
import { StaffProvider } from './context/StaffContext';

// This is our main App component - it's like the container that holds everything else
function App() {
  return (
    // Router helps us navigate between different pages (if we add more later)
    <Router>
      {/* DebugProvider helps us track what's happening in our app */}
      <DebugProvider>
        <DateProvider>
          <StaffProvider>
            {/* This div creates a full-height white background for our app */}
            <div className="min-h-screen bg-white">
              {/* Navigation bar at the top of the page */}
              <Navbar />
              {/* Main content area with some spacing around it */}
              <main className="container mx-auto px-4 py-8">
                {/* Tab system for organizing different sections */}
                <TabNavigation />
              </main>
              {/* Shows helpful information about what's happening in the app */}
              <DebugDisplay />
            </div>
          </StaffProvider>
        </DateProvider>
      </DebugProvider>
    </Router>
  );
}

export default App;
