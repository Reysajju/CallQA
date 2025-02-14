import React from 'react';
import { Star, Play, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  title: string;
  company: string;
  industry: string;
  size: 'Small' | 'Medium' | 'Enterprise';
  content: string;
  metrics: {
    roi: string;
    improvement: string;
    timeframe: string;
  };
  image: string;
  logo: string;
  videoUrl?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sarah Johnson",
    title: "Customer Service Director",
    company: "TechCorp Solutions",
    industry: "Technology",
    size: "Enterprise",
    content: "CallQA has revolutionized how we train and monitor our support team. The AI insights have helped us improve our customer satisfaction scores by 40% in just three months.",
    metrics: {
      roi: "320%",
      improvement: "40% CSAT increase",
      timeframe: "3 months"
    },
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1617791160588-241658c0f566?auto=format&fit=crop&q=80",
    videoUrl: "https://example.com/video1.mp4"
  },
  {
    name: "Michael Chen",
    title: "Operations Manager",
    company: "GlobalTech Inc",
    industry: "Software",
    size: "Medium",
    content: "The real-time analytics and actionable insights have transformed our customer service operations. Our team's efficiency has improved dramatically.",
    metrics: {
      roi: "250%",
      improvement: "35% faster resolution",
      timeframe: "6 months"
    },
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1617791160588-241658c0f566?auto=format&fit=crop&q=80"
  },
  {
    name: "Emily Rodriguez",
    title: "Customer Experience Lead",
    company: "Startup Innovations",
    industry: "E-commerce",
    size: "Small",
    content: "As a growing startup, CallQA has been invaluable in maintaining high service standards while scaling our operations. The AI-powered insights help us stay competitive.",
    metrics: {
      roi: "180%",
      improvement: "45% team efficiency",
      timeframe: "2 months"
    },
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80",
    logo: "https://images.unsplash.com/photo-1617791160588-241658c0f566?auto=format&fit=crop&q=80",
    videoUrl: "https://example.com/video2.mp4"
  }
];

export function Testimonials() {
  return (
    <div className="bg-brand-light py-24" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Customer Success Stories
          </h2>
          <p className="text-xl text-gray-600">
            See how companies are transforming their customer service with CallQA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl"
            >
              {/* Company Logo */}
              <div className="h-32 bg-gray-100 flex items-center justify-center p-4">
                <img
                  src={testimonial.logo}
                  alt={`${testimonial.company} logo`}
                  className="max-h-16 object-contain"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Video Thumbnail (if available) */}
                {testimonial.videoUrl && (
                  <div className="relative mb-4 rounded-lg overflow-hidden">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                )}

                {/* Quote */}
                <div className="mb-6">
                  <Quote className="w-8 h-8 text-brand-primary/20 mb-2" />
                  <p className="text-gray-600 italic">{testimonial.content}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-primary">
                      {testimonial.metrics.roi}
                    </div>
                    <div className="text-sm text-gray-500">ROI</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-primary">
                      {testimonial.metrics.improvement}
                    </div>
                    <div className="text-sm text-gray-500">Improvement</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-primary">
                      {testimonial.metrics.timeframe}
                    </div>
                    <div className="text-sm text-gray-500">Timeframe</div>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-brand-dark">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.title} at {testimonial.company}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-brand-light text-brand-primary rounded-full">
                    {testimonial.industry}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium bg-brand-light text-brand-primary rounded-full">
                    {testimonial.size}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}