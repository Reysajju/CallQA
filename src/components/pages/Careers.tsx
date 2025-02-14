import React from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { MapPin, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { Hero } from '../Hero';

export function Careers() {
  const positions = [
    {
      title: "Senior AI Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Join our AI team to build next-generation customer service analytics..."
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Karachi, Pakistan",
      type: "Full-time",
      description: "Lead product strategy and development for our core analytics platform..."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Lahore, Pakistan",
      type: "Full-time",
      description: "Help our enterprise customers achieve success with CallQA..."
    }
  ];

  const benefits = [
    {
      title: "Health & Wellness",
      items: ["Comprehensive health insurance", "Mental health support", "Gym memberships"]
    },
    {
      title: "Work-Life Balance",
      items: ["Flexible working hours", "Remote work options", "Unlimited PTO"]
    },
    {
      title: "Growth",
      items: ["Learning & development budget", "Conference attendance", "Career coaching"]
    },
    {
      title: "Team Building",
      items: ["Regular team events", "Annual retreats", "Social activities"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero
          title="Join Our Team"
          description="Help us transform customer service with AI-powered insights. We're looking for passionate individuals who want to make a difference."
          backgroundImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80"
          textAlignment="center"
        />

        {/* Open Positions */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-12">Open Positions</h2>
            
            <div className="grid gap-6">
              {positions.map((position, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-brand-dark mb-2">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {position.department}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {position.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {position.type}
                        </div>
                      </div>
                      <p className="text-gray-600">
                        {position.description}
                      </p>
                    </div>
                    <button className="mt-4 md:mt-0 inline-flex items-center text-brand-primary hover:text-brand-secondary">
                      Apply Now
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-brand-light py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-12 text-center">
              Why Join CallQA?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-brand-dark mb-4">
                    {benefit.title}
                  </h3>
                  <ul className="space-y-2">
                    {benefit.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}