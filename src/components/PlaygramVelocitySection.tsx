import { VelocityScroll } from "./ui/VelocityScroll";

const PlaygramVelocitySection = () => {
  return (
    <section className="py-24 bg-black overflow-hidden relative border-t border-gray-800/50">
      {/* Enhanced Background Elements with stronger black base */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black"></div>
      </div>
      
      <div className="absolute inset-0 opacity-8">
        <div className="absolute top-10 left-20 w-40 h-40 bg-[#D7243F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 bg-[#89D3EC] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10">
        <VelocityScroll
          text="PLAYGRAM"
          default_velocity={2}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter select-none"
          style={{
            fontFamily: "'Inter', 'Helvetica Neue', 'Arial Black', sans-serif",
            fontWeight: 900,
            letterSpacing: '-0.08em',
            background: 'linear-gradient(135deg, #D7243F 0%, #89D3EC 60%, #89D3EC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        />
      </div>

      {/* Additional glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-gradient-to-r from-transparent via-[#D7243F]/10 to-transparent blur-xl"></div>
      </div>

      {/* Behind the Scenes Title */}
      <div className="relative z-10 mb-12">
        <div className="text-center">
         
         
        </div>
      </div>

      {/* Powered by section */}
      <div className="relative z-10 mt-16">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-6">Powered by</p>
          <div className="flex items-center justify-center space-x-8">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:bg-white/20 transition-all duration-300">
              <img
                src="https://www.socialagent.in/_next/static/media/logoBlue.e3f23bf1.svg"
                alt="Social Agent"
                className="h-8 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:bg-white/20 transition-all duration-300">
              <img
                src="https://www.bricstal.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlogoBlue.e81ca8ae.webp&w=3840&q=75"
                alt="Bricstal"
                className="h-8 opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlaygramVelocitySection;