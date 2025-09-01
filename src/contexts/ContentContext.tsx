import React, { createContext, useContext, useState, useEffect } from 'react';

interface ContentData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    backgroundImage?: string;
  };
  pricing: {
    plans: Array<{
      name: string;
      price: string;
      features: string[];
      popular?: boolean;
    }>;
  };
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    content: string;
    rating: number;
    image?: string;
  }>;
  footer: {
    description: string;
    email: string;
    phone: string;
    address?: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      linkedin?: string;
    };
  };
  sportsStack: {
    title: string;
    subtitle: string;
    sports: Array<{
      name: string;
      description: string;
      features: string[];
      image?: string;
    }>;
  };
  coachingVideos: {
    title: string;
    subtitle: string;
    videos: Array<{
      title: string;
      description: string;
      thumbnail?: string;
      videoUrl?: string;
    }>;
  };
  benefits: {
    title: string;
    subtitle: string;
    benefits: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
}

interface ContentContextType {
  content: ContentData;
  updateContent: (section: keyof ContentData, data: any) => void;
  resetContent: () => void;
}

const defaultContent: ContentData = {
  hero: {
    title: 'Push Through Your Passion',
    subtitle: 'Train with Expert Coaches',
    description: 'Experience personalized sports coaching with our expert trainers. From football to swimming, we help you achieve your athletic goals with cutting-edge training methods and professional guidance.'
  },
  pricing: {
    plans: [
      {
        name: 'Basic Plan',
        price: '₹2,999/month',
        features: [
          '2 sessions per week',
          'Basic equipment access',
          'Group training sessions',
          'Progress tracking',
          'Mobile app access'
        ]
      },
      {
        name: 'Pro Plan',
        price: '₹4,999/month',
        popular: true,
        features: [
          '4 sessions per week',
          'Premium equipment access',
          '1-on-1 training sessions',
          'Nutrition guidance',
          'Performance analytics',
          'Video analysis',
          'Priority booking'
        ]
      },
      {
        name: 'Elite Plan',
        price: '₹7,999/month',
        features: [
          'Daily training sessions',
          'All equipment included',
          'Personal dedicated trainer',
          'Custom meal planning',
          'Advanced performance tracking',
          'Recovery sessions',
          'Competition preparation',
          '24/7 coach support'
        ]
      }
    ]
  },
  testimonials: [
    {
      id: '1',
      name: 'Rahul Sharma',
      role: 'Football Player',
      content: 'Playgram transformed my game completely. The personalized training and expert coaching helped me improve my skills dramatically. I went from amateur to semi-professional level in just 8 months.',
      rating: 5
    },
    {
      id: '2',
      name: 'Priya Patel',
      role: 'Swimming Enthusiast',
      content: 'The swimming coaches are incredible. Their technique-focused approach and patient guidance helped me overcome my fear of water and become a confident swimmer. Highly recommended!',
      rating: 5
    },
    {
      id: '3',
      name: 'Arjun Kumar',
      role: 'Basketball Player',
      content: 'Best investment I made for my basketball career. The coaches understand individual needs and create customized training programs. My shooting accuracy improved by 40%!',
      rating: 5
    }
  ],
  footer: {
    description: 'Your ultimate sports coaching platform connecting you with expert coaches across multiple sports disciplines.',
    email: 'info@playgram.com',
    phone: '+91 98765 43210',
    address: 'Sports Complex, Bangalore, Karnataka 560001',
    socialLinks: {
      facebook: 'https://facebook.com/playgram',
      twitter: 'https://twitter.com/playgram',
      instagram: 'https://instagram.com/playgram',
      linkedin: 'https://linkedin.com/company/playgram'
    }
  },
  sportsStack: {
    title: 'Master Every Sport',
    subtitle: 'Professional Training Across Multiple Disciplines',
    sports: [
      {
        name: 'Football',
        description: 'Master the beautiful game with professional football coaching',
        features: ['Skill Development', 'Tactical Training', 'Match Preparation', 'Fitness Conditioning']
      },
      {
        name: 'Basketball',
        description: 'Elevate your basketball skills with expert coaching',
        features: ['Shooting Techniques', 'Ball Handling', 'Team Strategy', 'Physical Conditioning']
      },
      {
        name: 'Swimming',
        description: 'Dive into excellence with comprehensive swimming training',
        features: ['Stroke Perfection', 'Endurance Building', 'Racing Techniques', 'Water Safety']
      },
      {
        name: 'Badminton',
        description: 'Perfect your badminton game with professional guidance',
        features: ['Racket Techniques', 'Court Movement', 'Strategy & Tactics', 'Mental Training']
      }
    ]
  },
  coachingVideos: {
    title: 'Coaching Videos',
    subtitle: 'Learn from the Best',
    videos: [
      {
        title: 'Football Training Fundamentals',
        description: 'Master the basics of football with our expert coaches'
      },
      {
        title: 'Swimming Stroke Techniques',
        description: 'Perfect your swimming strokes with professional guidance'
      },
      {
        title: 'Basketball Skills Development',
        description: 'Improve your basketball game with advanced techniques'
      }
    ]
  },
  benefits: {
    title: 'Why Choose Playgram?',
    subtitle: 'Discover the benefits of our comprehensive sports coaching platform',
    benefits: [
      {
        title: 'Expert Coaches',
        description: 'Train with certified professional coaches with years of experience'
      },
      {
        title: 'Personalized Training',
        description: 'Get customized training programs tailored to your skill level and goals'
      },
      {
        title: 'Modern Facilities',
        description: 'Access state-of-the-art equipment and training facilities'
      },
      {
        title: 'Progress Tracking',
        description: 'Monitor your improvement with detailed analytics and performance metrics'
      }
    ]
  }
};

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentData>(defaultContent);

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('playgramContent');
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        setContent({ ...defaultContent, ...parsedContent });
      } catch (error) {
        console.error('Error loading saved content:', error);
      }
    }
  }, []);

  // Save content to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('playgramContent', JSON.stringify(content));
  }, [content]);

  const updateContent = (section: keyof ContentData, data: any) => {
    setContent(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const resetContent = () => {
    setContent(defaultContent);
    localStorage.removeItem('playgramContent');
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, resetContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export default ContentContext;