import React from 'react';

export const WelcomeVideo: React.FC = () => {

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full">
        <video
          className="w-full h-full object-cover opacity-70"
          autoPlay
          muted
          loop
        >
          <source src="https://jenpaints.art/wp-content/uploads/2025/08/IMG_7998.mp4" type="video/mp4" />
        </video>
        
        {/* Logo overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="https://jenpaints.art/wp-content/uploads/2025/08/IMG_6671-removebg-preview.png"
            alt="Playgram Logo"
            className="w-80 h-80 object-contain"
          />
        </div>

        {/* Text overlay */}
        <div className="absolute bottom-64 left-0 right-0 text-center px-8">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            All Your Sports Details in One Platform
          </h1>
          <p className="text-white/80 text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Manage, Track, and Buy Merchandise
          </p>
        </div>


      </div>
    </div>
  );
};