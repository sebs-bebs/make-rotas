import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex justify-between items-center container mx-auto">
        <Link 
          to="/" 
          className="text-lg font-semibold text-purple-500 hover:text-purple-600 transition-colors duration-200"
        >
          Make Rotas
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
