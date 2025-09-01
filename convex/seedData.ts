import { mutation } from "./_generated/server";

export const seedSportsData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if sports already exist
    const existingSports = await ctx.db.query("sports").collect();
    if (existingSports.length > 0) {
      return "Sports data already exists";
    }

    // Seed sports data
    const sportsData = [
      {
        name: "Football",
        description: "Master the beautiful game with professional coaching techniques, tactical awareness, and skill development programs designed for all levels.",
        price: 99,
        trialPrice: 0,
        features: [
          "Individual Training Sessions",
          "Group Practice Sessions",
          "Match Analysis Videos",
          "Nutrition Guidance",
          "Performance Tracking",
          "24/7 Coach Support"
        ],
        videoUrl: "https://player.vimeo.com/video/example1",
        imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600"
      },
      {
        name: "Basketball",
        description: "Elevate your basketball IQ with comprehensive training in shooting, dribbling, defense, and team strategies from experienced coaches.",
        price: 89,
        trialPrice: 0,
        features: [
          "Shooting Technique Training",
          "Defensive Strategies",
          "Team Play Coaching",
          "Fitness Programs",
          "Game Film Review",
          "Mental Conditioning"
        ],
        videoUrl: "https://player.vimeo.com/video/example2",
        imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600"
      },
      {
        name: "Badminton",
        description: "Perfect your racquet skills with precision training in footwork, shot selection, and competitive strategies for singles and doubles play.",
        price: 79,
        trialPrice: 0,
        features: [
          "Footwork Development",
          "Shot Precision Training",
          "Court Positioning",
          "Doubles Strategy",
          "Equipment Guidance",
          "Tournament Preparation"
        ],
        videoUrl: "https://player.vimeo.com/video/example3",
        imageUrl: "https://images.unsplash.com/photo-1544717684-6e5e4c2b5b5b?w=600"
      },
      {
        name: "Swimming",
        description: "Dive into excellence with stroke technique refinement, endurance building, and competitive swimming strategies for all swimming styles.",
        price: 109,
        trialPrice: 0,
        features: [
          "Stroke Technique Refinement",
          "Breathing Optimization",
          "Endurance Building",
          "Racing Strategies",
          "Pool Safety Training",
          "Competition Coaching"
        ],
        videoUrl: "https://player.vimeo.com/video/example4",
        imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600"
      }
    ];

    for (const sport of sportsData) {
      await ctx.db.insert("sports", sport);
    }

    return "Sports data seeded successfully";
  },
});

export const seedTestimonialsData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if testimonials already exist
    const existingTestimonials = await ctx.db.query("testimonials").collect();
    if (existingTestimonials.length > 0) {
      return "Testimonials data already exists";
    }

    // Seed testimonials data
    const testimonialsData = [
      {
        name: "Alex Rodriguez",
        sport: "Football",
        rating: 5,
        comment: "Playgram transformed my game completely. The personalized coaching and detailed feedback helped me improve my technique and tactical understanding. I went from bench player to starting midfielder in just 6 months!",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
      {
        name: "Sarah Chen",
        sport: "Basketball",
        rating: 5,
        comment: "The basketball coaching program exceeded my expectations. The shooting drills and defensive strategies I learned here helped me secure a college scholarship. The coaches really care about your progress.",
        imageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"
      },
      {
        name: "Marcus Johnson",
        sport: "Swimming",
        rating: 5,
        comment: "As a competitive swimmer, I was struggling with my freestyle technique. The detailed stroke analysis and breathing exercises from Playgram helped me drop 3 seconds from my 100m time!",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
      },
      {
        name: "Priya Patel",
        sport: "Badminton",
        rating: 5,
        comment: "The badminton coaching here is world-class. My footwork and shot placement improved dramatically. I won my first tournament after just 4 months of training with Playgram!",
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
      },
      {
        name: "David Kim",
        sport: "Football",
        rating: 5,
        comment: "The tactical knowledge I gained from the football program is incredible. Understanding positioning and game flow has made me a much smarter player. Highly recommend to any serious footballer.",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
      },
      {
        name: "Emma Thompson",
        sport: "Basketball",
        rating: 5,
        comment: "Playgram's basketball program helped me develop confidence on the court. The mental conditioning and skill development sessions were game-changers for my performance.",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
      }
    ];

    for (const testimonial of testimonialsData) {
      await ctx.db.insert("testimonials", testimonial);
    }

    return "Testimonials data seeded successfully";
  },
});
