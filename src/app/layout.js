// src/app/layout.js
import './globals.css';
import React from 'react';
import Button from '@/components/Button'; // Import the Button component

export const metadata = {
  title: 'Make Rotas',
  description: 'A Next.js app for creating staff schedules',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-100">
        <header className="bg-white shadow px-6 pt-2.5 pb-2 rounded-md mb-4 flex justify-between items-center">
          <h1 className="text-0.5xl font-bold text-primary">Make Rotas</h1>
          {/* Add the navigation buttons here */}
          {/* Removed week navigation buttons as they are now in page.js */}
        </header>
        <main className="flex-grow container mx-auto px-4 py-6 bg-white rounded-md shadow">
          {children}
        </main>
        <footer className="bg-white border-t p-4 text-center rounded-md mt-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Make Rotas
          </p>
        </footer>
      </body>
    </html>
  );
}