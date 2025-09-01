"use client";
import React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  MotionValue,
} from "motion/react";
import { cn } from "../../lib/utils";

export const CoachingParallax = ({
  photos,
}: {
  photos: {
    title: string;
    sport: string;
    thumbnail: string;
  }[];
}) => {
  const firstRow = photos.slice(0, 5);
  const secondRow = photos.slice(5, 10);
  const thirdRow = photos.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[300vh] py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d] bg-gradient-to-br from-gray-900 via-gray-800 to-black"
    >
      <CoachingHeader />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((photo) => (
            <CoachingCard
              photo={photo}
              translate={translateX}
              key={photo.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20">
          {secondRow.map((photo) => (
            <CoachingCard
              photo={photo}
              translate={translateXReverse}
              key={photo.title}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((photo) => (
            <CoachingCard
              photo={photo}
              translate={translateX}
              key={photo.title}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const CoachingHeader = () => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <span className="text-white">Behind the </span>
          <span className="bg-gradient-to-r from-[#D7243F] to-[#89D3EC] bg-clip-text text-transparent">
            Scenes
          </span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Experience the energy and dedication of our coaching sessions through these captured moments of athletic excellence.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(215, 36, 63, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] text-white font-bold text-lg rounded-full shadow-2xl"
          >
            View Full Gallery
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-[#89D3EC] text-[#89D3EC] rounded-full font-bold text-lg hover:bg-[#89D3EC] hover:text-gray-900 transition-all duration-300"
          >
            Book a Session
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const CoachingCard = ({
  photo,
  translate,
}: {
  photo: {
    title: string;
    sport: string;
    thumbnail: string;
  };
  translate: MotionValue<number>;
}) => {
  const getSportColor = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'football':
        return 'from-[#D7243F] to-red-600';
      case 'basketball':
        return 'from-orange-500 to-[#D7243F]';
      case 'badminton':
        return 'from-[#89D3EC] to-blue-500';
      case 'swimming':
        return 'from-blue-400 to-[#89D3EC]';
      default:
        return 'from-[#D7243F] to-[#89D3EC]';
    }
  };

  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={photo.title}
      className="group/photo h-96 w-[30rem] relative shrink-0"
    >
      <div className="block group-hover/photo:shadow-2xl relative h-full w-full">
        <img
          src={photo.thumbnail}
          height="600"
          width="600"
          className="object-cover object-center absolute h-full w-full inset-0 rounded-2xl border border-gray-700"
          alt={photo.title}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 h-full w-full opacity-0 group-hover/photo:opacity-80 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none rounded-2xl transition-opacity duration-300"></div>
        
        {/* Sport badge */}
        <div className="absolute top-4 right-4 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300">
          <span className={cn(
            "px-3 py-1 bg-gradient-to-r text-white text-sm font-medium rounded-full",
            getSportColor(photo.sport)
          )}>
            {photo.sport}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-4 left-4 opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300">
          <h2 className="text-white font-bold text-xl mb-2">{photo.title}</h2>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-[#D7243F] to-[#89D3EC] rounded-full"></div>
            <span className="text-[#89D3EC] text-sm font-medium">Playgram Coaching</span>
          </div>
        </div>

        {/* Hover border effect */}
        <div className="absolute inset-0 border-2 border-transparent group-hover/photo:border-[#89D3EC] rounded-2xl transition-colors duration-300"></div>
      </div>
    </motion.div>
  );
};