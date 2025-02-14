import React from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Users, Target, Award, Heart } from 'lucide-react';
import { Hero } from '../Hero';

export function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero
          title="Our Mission"
          description="We're on a mission to revolutionize customer service through AI-powered insights, helping businesses deliver exceptional experiences at scale."
          backgroundImage="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80"
          textAlignment="center"
        />

        {/* Values Section */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-dark">Our Values</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Users,
                  title: "Customer First",
                  description: "Everything we do starts with our customers' needs"
                },
                {
                  icon: Target,
                  title: "Innovation",
                  description: "Pushing boundaries with cutting-edge AI technology"
                },
                {
                  icon: Award,
                  title: "Excellence",
                  description: "Striving for the highest quality in everything we do"
                },
                {
                  icon: Heart,
                  title: "Empathy",
                  description: "Understanding and caring for our customers' success"
                }
              ].map((value, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-light text-brand-primary mb-4">
                    <value.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-brand-light py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-brand-dark">Our Team</h2>
              <p className="text-xl text-gray-600 mt-4">
                Meet the passionate people behind CallQA
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "CEO & Co-founder",
                  image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80"
                },
                {
                  name: "Michael Rodriguez",
                  role: "CTO",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"
                },
                {
                  name: "Emily Thompson",
                  role: "Head of AI",
                  image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80"
                }
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
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