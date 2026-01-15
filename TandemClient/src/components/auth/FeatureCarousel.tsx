import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Brain, Sparkles, TrendingUp, Zap, Heart } from 'lucide-react';

interface FeatureCarouselProps {
  type: 'signup' | 'login';
}

interface Slide {
  title: string;
  description: string;
  icon?: React.ReactNode;
  features?: string[];
}

const signupSlides: Slide[] = [
  {
    title: 'Start your journey together',
    description: 'Join Tandem and build healthier relationships with your partner through shared goals and habits.',
    icon: null,
  },
  {
    title: 'AI-Powered Wellness',
    description: 'Experience intelligent features that understand your needs and provide personalized insights.',
    icon: <Brain className="w-16 h-16 text-white/90" />,
    features: [
      'AI Coach - Get personalized wellness advice',
      'AI Nutrition Recommendations - Smart meal planning',
      'Weekly AI Summary - Insights into your progress',
    ],
  },
  {
    title: 'Advanced AI Features',
    description: 'More intelligent tools to enhance your wellness journey.',
    icon: <Sparkles className="w-16 h-16 text-white/90" />,
    features: [
      'Health Log AI Parsing - Automatic activity tracking',
      'AI Date Night Suggestions - Personalized date ideas',
      'AI Analytics Insights - Data-driven recommendations',
    ],
  },
  {
    title: 'Automated Workflows',
    description: 'Streamline your wellness journey with powerful automation powered by n8n.',
    icon: <Zap className="w-16 h-16 text-white/90" />,
    features: [
      'Automated meal planning',
      'Smart pantry management',
      'Seamless grocery ordering',
    ],
  },
  {
    title: 'Core Features',
    description: 'Everything you need to track and improve your wellness together.',
    icon: null,
    features: [
      'Health Logger & Habits',
      'Pantry & Meal Planner',
      'Recipes & Goals',
      'Budget & Mood Tracking',
    ],
  },
];

const loginSlides: Slide[] = [
  {
    title: 'Welcome back to Tandem',
    description: 'Your partner in building healthier relationships and better habits together.',
    icon: null,
  },
  {
    title: 'Continue Your Journey',
    description: 'Track your progress, achieve your goals, and grow stronger together.',
    icon: <Heart className="w-16 h-16 text-white/90" />,
    features: [
      'Personalized insights await',
      'Stay on track with your goals',
      'Connect with your partner',
    ],
  },
  {
    title: 'Your Wellness Hub',
    description: 'Everything you need to maintain a healthy lifestyle is right here.',
    icon: <TrendingUp className="w-16 h-16 text-white/90" />,
    features: [
      'AI-powered recommendations',
      'Automated workflows',
      'Comprehensive tracking',
    ],
  },
];

export const FeatureCarousel: React.FC<FeatureCarouselProps> = ({ type }) => {
  const slides = type === 'signup' ? signupSlides : loginSlides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const lastWheelTime = useRef<number>(0);
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const minSwipeDistance = 50;
  const wheelThrottle = 500; // ms between wheel events

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Mouse drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.clientX;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Horizontal wheel scrolling - left/right navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning) {
        e.preventDefault();
        return;
      }

      const now = Date.now();
      const timeSinceLastWheel = now - lastWheelTime.current;

      if (timeSinceLastWheel < wheelThrottle) {
        e.preventDefault();
        return;
      }

      // Clear any pending timeout
      if (wheelTimeout.current) {
        clearTimeout(wheelTimeout.current);
      }

      // Use deltaX for horizontal scrolling, deltaY as fallback
      const scrollDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      
      // Only process if significant scroll
      if (Math.abs(scrollDelta) > 30) {
        e.preventDefault();
        lastWheelTime.current = now;

        // Right scroll or down scroll = next slide
        // Left scroll or up scroll = previous slide
        if (scrollDelta > 0) {
          nextSlide();
        } else {
          prevSlide();
        }

        // Prevent further scrolling for a short time
        wheelTimeout.current = setTimeout(() => {
          lastWheelTime.current = 0;
        }, wheelThrottle);
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        carousel.removeEventListener('wheel', handleWheel);
        if (wheelTimeout.current) {
          clearTimeout(wheelTimeout.current);
        }
      };
    }
  }, [isTransitioning]);

  const currentSlideData = slides[currentSlide];

  return (
    <div 
      ref={carouselRef}
      className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#53389E] via-[#6B4FA8] to-[#53389E] items-center justify-center p-12 relative overflow-hidden h-screen [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div className="relative z-10 w-full max-w-lg h-full flex flex-col justify-center">
        {/* Tandem Title - Professional Styling */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-6xl font-light text-white tracking-[0.2em] uppercase letter-spacing-wider" style={{ fontFamily: 'ui-serif, Georgia, serif', letterSpacing: '0.15em' }}>
            Tandem
          </h1>
        </div>

        {/* Carousel Content - Glass-morphism Card */}
        <div className="flex-1 flex flex-col justify-center">
          <div 
            className={`backdrop-blur-md bg-white/10 rounded-2xl p-8 border border-white/20 shadow-2xl transition-opacity duration-400 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {currentSlideData.icon && (
              <div className="mb-6 flex justify-center">
                {currentSlideData.icon}
              </div>
            )}
            
            <h2 className="text-3xl font-semibold text-white mb-4 text-center font-sans">
              {currentSlideData.title}
            </h2>
            
            <p className="text-white text-base opacity-95 mb-6 leading-relaxed text-center font-sans">
              {currentSlideData.description}
            </p>

            {currentSlideData.features && (
              <ul className="space-y-3 mb-8">
                {currentSlideData.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80 flex-shrink-0" />
                    <span className="text-white/95 text-sm leading-relaxed font-sans">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>

        {/* Navigation Arrows - Centered */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

