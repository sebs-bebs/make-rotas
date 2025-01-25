import logo from './logo.svg';
import './App.css';
import Navbar from './components/Navbar';
import TabNavigation from './components/TabNavigation';
import { BrowserRouter as Router } from 'react-router-dom';
import { DebugProvider } from './context/DebugContext';
import DebugDisplay from './components/DebugDisplay';

function App() {
  return (
    <Router>
      <DebugProvider>
        <div className="min-h-screen bg-white">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <TabNavigation />
          </main>
          <DebugDisplay />
        </div>
      </DebugProvider>
    </Router>
  );
}

export default App;
