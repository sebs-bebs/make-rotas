import React from 'react';
import Link from 'next/link';

const LaunchPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Hero Section */}
      <header className="bg-indigo-600 text-white w-full text-center py-10">
        <h1 className="text-4xl font-bold mb-4">Welcome to Make Rotas</h1>
        <p className="text-lg">The ultimate tool for seamless staff scheduling and management.</p>
      </header>

      {/* Features Section */}
      <main className="container mx-auto px-4 py-10 text-gray-700">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Why Choose Make Rotas?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Drag-and-drop shift assignment for ease.</li>
            <li>Customizable shift times and remarks.</li>
            <li>Weekly hour calculations for efficiency.</li>
            <li>Responsive design for access on any device.</li>
          </ul>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Get Started Today!</h2>
          <Link href="/">
            <div className="bg-indigo-600 text-white py-2 px-6 rounded shadow hover:bg-indigo-700 transition">
              Go to App
            </div>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-800 text-white py-4 text-center">
        <p>&copy; {new Date().getFullYear()} Make Rotas. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LaunchPage;
