import React from 'react';
import { Link } from 'react-router-dom';
import { useDebug } from '../context/DebugContext';

const Navbar = () => {
  const { toggleDebug } = useDebug();

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex justify-between items-center container mx-auto">
        <Link 
          to="/" 
          className="text-lg font-semibold text-purple-500 hover:text-purple-600 transition-colors duration-200"
        >
          Make Rotas
        </Link>
        <button
          onClick={toggleDebug}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
        >
          Debug View
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
