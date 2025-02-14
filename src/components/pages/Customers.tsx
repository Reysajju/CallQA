import React from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Star, ArrowRight } from 'lucide-react';
import { Hero } from '../Hero';

export function Customers() {
  const caseStudies = [
    {
      company: "TechCorp Solutions",
      industry: "Technology",
      results: {
        satisfaction: "+40%",
        efficiency: "+35%",
        costs: "-25%"
      },
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80",
      quote: "CallQA has transformed how we handle customer support, leading to significant improvements in satisfaction scores."
    },
    {
      company: "GlobalTech Inc",
      industry: "Software",
      results: {
        satisfaction: "+45%",
        efficiency: "+30%",
        costs: "-20%"
      },
      image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&q=80",
      quote: "The AI-powered insights have helped us optimize our customer service operations dramatically."
    },
    {
      company: "Startup Innovations",
      industry: "E-commerce",
      results: {
        satisfaction: "+35%",
        efficiency: "+40%",
        costs: "-30%"
      },
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80",
      quote: "As a growing startup, CallQA has been instrumental in maintaining high service standards."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero
          title="Customer Success Stories"
          description="See how leading companies are transforming their customer service with CallQA"
          backgroundImage="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80"
          textAlignment="center"
        />

        {/* Case Studies */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {caseStudies.map((study, index) => (
              <div key={index} className="mb-16 last:mb-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className={index % 2 === 0 ? 'order-1' : 'order-1 lg:order-2'}>
                    <img
                      src={study.image}
                      alt={study.company}
                      className="rounded-lg shadow-lg w-full h-96 object-cover"
                    />
                  </div>
                  <div className={index % 2 === 0 ? 'order-2' : 'order-2 lg:order-1'}>
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold text-brand-dark">
                        {study.company}
                      </h2>
                      <p className="text-gray-600">
                        Industry: {study.industry}
                      </p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-brand-light p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-brand-primary">
                            {study.results.satisfaction}
                          </div>
                          <div className="text-sm text-gray-600">
                            Satisfaction
                          </div>
                        </div>
                        <div className="bg-brand-light p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-brand-primary">
                            {study.results.efficiency}
                          </div>
                          <div className="text-sm text-gray-600">
                            Efficiency
                          </div>
                        </div>
                        <div className="bg-brand-light p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-brand-primary">
                            {study.results.costs}
                          </div>
                          <div className="text-sm text-gray-600">
                            Costs
                          </div>
                        </div>
                      </div>
                      <blockquote className="text-lg italic text-gray-600">
                        "{study.quote}"
                      </blockquote>
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                      <button className="inline-flex items-center text-brand-primary hover:text-brand-secondary">
                        Read full case study
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}