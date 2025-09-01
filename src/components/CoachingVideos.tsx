import { motion } from "framer-motion";
import { useState } from "react";
import { useContent } from "../contexts/ContentContext";

const videos = [
  {
    id: 1,
    title: "Football Masterclass",
    sport: "Football",
    duration: "45 min",
    thumbnail: "https://thephysiocompany.co.uk/wp-content/uploads/football.jpg",
    videoUrl: "https://player.vimeo.com/video/example1"
  },
  {
    id: 2,
    title: "Basketball Fundamentals",
    sport: "Basketball", 
    duration: "38 min",
    thumbnail: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400",
    videoUrl: "https://player.vimeo.com/video/example2"
  },
  {
    id: 3,
    title: "Badminton Techniques",
    sport: "Badminton",
    duration: "32 min", 
    thumbnail: "https://us.yonex.com/cdn/shop/files/Product_Banner_BadmintonProRacquets_Mobile.jpg?v=1750184928&width=3840",
    videoUrl: "https://player.vimeo.com/video/example3"
  },
  {
    id: 4,
    title: "Swimming Strokes",
    sport: "Swimming",
    duration: "41 min",
    thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7QfPieiiNZen0w4VcS_D0uqeOj51HPK06Qg&s", 
    videoUrl: "https://player.vimeo.com/video/example4"
  },
  {
    id: 5,
    title: "Advanced Football Tactics",
    sport: "Football",
    duration: "52 min",
    thumbnail: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400",
    videoUrl: "https://player.vimeo.com/video/example5"
  },
  {
    id: 6,
    title: "Basketball Defense",
    sport: "Basketball",
    duration: "29 min",
    thumbnail: "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=400",
    videoUrl: "https://player.vimeo.com/video/example6"
  }
];

const CoachingVideos = () => {
  const { content } = useContent();
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  return (
    <section className="py-20 px-4" style={{
      background: 'radial-gradient(ellipse at top center, rgba(137, 211, 236, 0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom left, rgba(215, 36, 63, 0.08) 0%, transparent 60%), linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
              {content.coachingVideos.title.split(' ')[0]}
            </span>
            <span className="text-white"> {content.coachingVideos.title.split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {content.coachingVideos.subtitle}
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`
                relative group cursor-pointer overflow-hidden rounded-2xl
                ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                ${index === 3 ? 'lg:col-span-2' : ''}
                ${index === 4 ? 'lg:row-span-2' : ''}
              `}
              onClick={() => setSelectedVideo(video.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              <div className="absolute inset-0 flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  <span className="px-3 py-1 bg-[#D7243F]/20 border border-[#D7243F] text-[#D7243F] rounded-full text-sm font-medium">
                    {video.sport}
                  </span>
                  <span className="px-3 py-1 bg-gray-900/60 text-gray-300 rounded-full text-sm">
                    {video.duration}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#89D3EC] transition-colors">
                    {video.title}
                  </h3>
                  
                  <motion.div
                    className="flex items-center space-x-2 text-gray-300"
                    whileHover={{ x: 5 }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">Watch Now</span>
                  </motion.div>
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-16 h-16 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full flex items-center justify-center shadow-2xl"
                >
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Modal */}
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <iframe
                src={videos.find(v => v.id === selectedVideo)?.videoUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CoachingVideos;
