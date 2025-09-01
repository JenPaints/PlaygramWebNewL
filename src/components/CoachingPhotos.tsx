import { CoachingParallax } from "./ui/coaching-parallax";

// Coaching photos data for the parallax effect
const coachingPhotos = [
  {
    title: "Football Training Session",
    sport: "Football",
    thumbnail: "https://cdn.pixabay.com/photo/2015/01/26/22/40/child-613199_640.jpg",
  },
  {
    title: "Basketball Practice",
    sport: "Basketball",
    thumbnail: "https://kingsquaresportscentre.com/wp-content/uploads/2023/09/AdobeStock_520402576-scaled.jpeg",
  },
  {
    title: "Badminton Coaching",
    sport: "Badminton",
    thumbnail: "https://us.yonex.com/cdn/shop/files/Product_Banner_BadmintonProRacquets_Mobile.jpg?v=1750184928&width=3840",
  },
  {
    title: "Swimming Lessons",
    sport: "Swimming",
    thumbnail: "https://ucpa.imgix.net/strapi/00010071_UKBANNER_2x13_060af29291.jpg",
  },
  {
    title: "Team Strategy Session",
    sport: "Football",
    thumbnail: "https://cdn.pixabay.com/photo/2015/01/26/22/40/child-613199_640.jpg",
  },
  {
    title: "Individual Training",
    sport: "Basketball",
    thumbnail: "https://kingsquaresportscentre.com/wp-content/uploads/2023/09/AdobeStock_520402576-scaled.jpeg",
  },
  {
    title: "Group Badminton Session",
    sport: "Badminton",
    thumbnail: "https://us.yonex.com/cdn/shop/files/Product_Banner_BadmintonProRacquets_Mobile.jpg?v=1750184928&width=3840",
  },
  {
    title: "Advanced Swimming",
    sport: "Swimming",
    thumbnail: "https://ucpa.imgix.net/strapi/00010071_UKBANNER_2x13_060af29291.jpg",
  },
  {
    title: "Youth Football Program",
    sport: "Football",
    thumbnail: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=600&h=600&fit=crop&crop=center",
  },
  {
    title: "Professional Basketball",
    sport: "Basketball",
    thumbnail: "https://kingsquaresportscentre.com/wp-content/uploads/2023/09/AdobeStock_520402576-scaled.jpeg",
  },
  {
    title: "Competitive Badminton",
    sport: "Badminton",
    thumbnail: "https://us.yonex.com/cdn/shop/files/Product_Banner_BadmintonProRacquets_Mobile.jpg?v=1750184928&width=3840",
  },
  {
    title: "Elite Swimming Training",
    sport: "Swimming",
    thumbnail: "https://ucpa.imgix.net/strapi/00010071_UKBANNER_2x13_060af29291.jpg",
  },
  {
    title: "Fitness & Conditioning",
    sport: "Football",
    thumbnail: "https://cdn.pixabay.com/photo/2015/01/26/22/40/child-613199_640.jpg",
  },
  {
    title: "Mental Training Session",
    sport: "Basketball",
    thumbnail: "https://kingsquaresportscentre.com/wp-content/uploads/2023/09/AdobeStock_520402576-scaled.jpeg",
  },
  {
    title: "Recovery & Wellness",
    sport: "Swimming",
    thumbnail: "https://ucpa.imgix.net/strapi/00010071_UKBANNER_2x13_060af29291.jpg",
  },
];

const CoachingPhotos = () => {
  return (
    <section className="relative min-h-screen py-20 bg-black overflow-hidden">
      {/* Strong black background with subtle gradients */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/20 to-black"></div>
      </div>

      {/* Subtle accent elements */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#D7243F] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-[#89D3EC] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full blur-3xl opacity-15"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-center mb-16 px-4">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Training in Action
        </h2>
        <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Experience the intensity and dedication of our coaching sessions through these captured moments
        </p>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <CoachingParallax photos={coachingPhotos} />
      </div>

      {/* Border elements for better definition */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
    </section>
  );
};

export default CoachingPhotos;
