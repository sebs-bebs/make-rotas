'use client';

const LaunchPage = () => {
  return (
    <div className="bg-white w-full min-h-screen p-4">
      <div className="w-full flex flex-row gap-4">
        <div className="flex-1 mx-10 mt-10">
          {/* Left column content */}
          <h1 className="text-3xl font-bold text-gray-600">Take Control of Your Team's Schedule Today</h1>
          <h2 className="text-xl font-medium text-gray-900 mt-4">An intuitive interface that makes shift planning easier than ever before</h2>
          <h3 className="text-lg font-regular text-gray-700 mt-4">💼 500+ Hours Saved Monthly by Managers Like You</h3>
          <h3 className="text-lg font-regular text-gray-700 mt-2">🎯 Cut Rota Planning Time by Over 60%</h3>
          <button className="bg-purple-500 hover:bg-purple-700 text-white font-semibold py-2 px-8 rounded-full mt-4">Try Now</button>
        </div>
        <div className="flex-1">
          {/* Right column content */}
          <img 
            src="/assets/images/hero_image.png"
            alt="Rota Table"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default LaunchPage;
