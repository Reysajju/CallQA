import React, { useState } from 'react';
import { 
  Wand2, Brain, BarChart3, Clock, Users, Lock, 
  Zap, Database, Headphones, Shield, Server, Code,
  Info
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
  category: 'Core' | 'Advanced' | 'Enterprise';
  availableIn: ('Startup' | 'Small Business' | 'Enterprise')[];
}

const features: Feature[] = [
  {
    title: "AI-Powered Analysis",
    description: "Advanced algorithms analyze calls for tone, clarity, and professionalism in real-time.",
    icon: Wand2,
    category: 'Core',
    availableIn: ['Startup', 'Small Business', 'Enterprise']
  },
  {
    title: "Smart Insights",
    description: "Get actionable recommendations to improve call quality and customer satisfaction.",
    icon: Brain,
    category: 'Core',
    availableIn: ['Startup', 'Small Business', 'Enterprise']
  },
  {
    title: "Performance Analytics",
    description: "Comprehensive dashboards tracking key metrics and improvement trends.",
    icon: BarChart3,
    category: 'Core',
    availableIn: ['Startup', 'Small Business', 'Enterprise']
  },
  {
    title: "Real-Time Monitoring",
    description: "Live call quality assessment and instant feedback for agents.",
    icon: Clock,
    category: 'Advanced',
    availableIn: ['Small Business', 'Enterprise']
  },
  {
    title: "Team Collaboration",
    description: "Share insights and best practices across your customer service team.",
    icon: Users,
    category: 'Advanced',
    availableIn: ['Small Business', 'Enterprise']
  },
  {
    title: "Enterprise Security",
    description: "Advanced encryption and compliance features for enterprise needs.",
    icon: Lock,
    category: 'Enterprise',
    availableIn: ['Enterprise']
  },
  {
    title: "API Integration",
    description: "Seamless integration with your existing tools and workflows.",
    icon: Code,
    category: 'Advanced',
    availableIn: ['Small Business', 'Enterprise']
  },
  {
    title: "Performance Optimization",
    description: "Advanced optimization tools for large-scale deployments.",
    icon: Zap,
    category: 'Enterprise',
    availableIn: ['Enterprise']
  },
  {
    title: "Data Management",
    description: "Comprehensive data retention and management capabilities.",
    icon: Database,
    category: 'Advanced',
    availableIn: ['Small Business', 'Enterprise']
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock premium support with dedicated account manager.",
    icon: Headphones,
    category: 'Enterprise',
    availableIn: ['Enterprise']
  },
  {
    title: "Advanced Security",
    description: "Enterprise-grade security features and compliance tools.",
    icon: Shield,
    category: 'Enterprise',
    availableIn: ['Enterprise']
  },
  {
    title: "Custom Deployment",
    description: "Tailored deployment options including on-premises solutions.",
    icon: Server,
    category: 'Enterprise',
    availableIn: ['Enterprise']
  }
];

export function Features() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Core', 'Advanced', 'Enterprise'];

  const filteredFeatures = selectedCategory === 'All' 
    ? features 
    : features.filter(feature => feature.category === selectedCategory);

  return (
    <div className="bg-white py-24" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Powerful Features for Better Calls
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Everything you need to analyze and improve your customer service
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center space-x-4 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-6 py-2 rounded-full transition-all duration-200",
                selectedCategory === category
                  ? "bg-brand-primary text-white"
                  : "bg-brand-light text-brand-dark hover:bg-brand-primary/10"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFeatures.map((feature, index) => (
            <div
              key={index}
              className="relative group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-brand-primary/10 text-brand-primary">
                    <feature.icon className="h-6 w-6" />
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  
                  {/* Available In Tags */}
                  <div className="flex flex-wrap gap-2">
                    {feature.availableIn.map((plan) => (
                      <span
                        key={plan}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-light text-brand-primary"
                      >
                        {plan}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Info Tooltip */}
                <div className="group relative">
                  <Info className="h-5 w-5 text-gray-400 hover:text-brand-primary cursor-help" />
                  <div className="absolute right-0 w-64 p-4 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <p className="text-sm text-gray-600">
                      Learn more about {feature.title} and how it can benefit your team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}