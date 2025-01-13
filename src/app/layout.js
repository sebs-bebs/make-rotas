import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Make Rotas',
  description: 'A Next.js app for creating staff schedules',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/*
        Added bg-gray-100 to give a light gray background.
        This helps the main content area (the white container) stand out better.
      */}
      <body className="min-h-screen flex flex-col bg-gray-100">
        {/* Header */}
        {/*
          Increased padding from p-4 to p-6 for more breathing space.
          Rounded the corners slightly less aggressively from rounded-xl to rounded-md.
          Added mb-4 for spacing below the header.
        */}
        <header className="bg-white shadow p-6 rounded-md mb-4">
          <h1 className="text-2xl font-bold text-primary">Make Rotas</h1>
        </header>

        {/* Main Content */}
        {/*
          Used container mx-auto for a responsive center alignment.
          Increased top/bottom padding to py-6 for more vertical space.
          Used px-4 for side padding, but feel free to adjust.
          Rounded-md for consistency with the header, plus shadow for depth.
        */}
        <main className="flex-grow container mx-auto px-4 py-6 bg-white rounded-md shadow">
          {children}
        </main>

        {/* Footer */}
        {/*
          Added mt-4 to separate the footer from main content.
          Used border-t for a top border and consistent rounded-md corners.
        */}
        <footer className="bg-white border-t p-4 text-center rounded-md mt-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} My Rota App
          </p>
        </footer>
      </body>
    </html>
  );
}
