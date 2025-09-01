import { MacbookScroll } from "./ui/macbook-scroll";

const MacBookShowcase = () => {
  return (
    <div className="overflow-hidden" style={{
      background: 'radial-gradient(ellipse at bottom center, rgba(215, 36, 63, 0.1) 0%, transparent 50%), radial-gradient(ellipse at top right, rgba(137, 211, 236, 0.08) 0%, transparent 60%), linear-gradient(135deg, #000000 0%, #0a0a0a 100%)'
    }}>
      <MacbookScroll
        title={
          <span className="text-white">
            Experience Playgram on{" "}
            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
              Every Device
            </span>
          </span>
        }
        src="https://jenpaints.art/wp-content/uploads/2025/08/Screenshot-2025-08-03-at-00.13.52.png"
        showGradient={false}
        badge={
          <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-xs font-medium">Live App</span>
          </div>
        }
      />
    </div>
  );
};

export default MacBookShowcase;