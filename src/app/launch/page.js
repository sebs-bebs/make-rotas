import { Hero } from '@/components/ui/hero-with-image-text-and-two-buttons';

const LaunchPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Hero Section */}
      <Hero />

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
          {/* Add any additional content for the Call to Action section here */}
        </section>
      </main>
    </div>
  );
};

export default LaunchPage;