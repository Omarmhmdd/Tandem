import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Brain, Sparkles, FileText, TrendingUp, Zap, Heart, ShoppingBag, UtensilsCrossed, Target, DollarSign, Calendar, CheckSquare } from 'lucide-react';
import { Logo } from '../Logo';

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
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);

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

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
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
      className="hidden lg:flex lg:w-1/2 bg-[#53389E] items-center justify-center p-12 relative overflow-hidden h-screen"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <div className="relative z-10 w-full max-w-lg h-full flex flex-col justify-center">
        {/* Tandem Title - At the top (purple section only) */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-5xl font-bold text-white font-sans tracking-tight">
            Tandem
          </h1>
        </div>

        {/* Carousel Content - Fits slide properly */}
        <div className="flex-1 flex flex-col justify-center">
          <div 
            className={`transition-opacity duration-400 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {currentSlideData.icon && (
              <div className="mb-6 flex justify-center">
                {currentSlideData.icon}
              </div>
            )}
            
            <h2 className="text-3xl font-semibold text-white mb-4 font-sans">
              {currentSlideData.title}
            </h2>
            
            <p className="text-white text-base opacity-95 mb-6 leading-relaxed font-sans">
              {currentSlideData.description}
            </p>

            {currentSlideData.features && (
              <ul className="space-y-3 mb-8">
                {currentSlideData.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80 mt-2 flex-shrink-0" />
                    <span className="text-white/95 text-sm leading-relaxed font-sans">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white w-8 h-2'
                    : 'bg-white/40 hover:bg-white/60 w-2 h-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation Arrows - Beside each other */}
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

