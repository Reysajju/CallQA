import React from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Hero } from '../Hero';

export function Blog() {
  const posts = [
    {
      title: "The Future of Customer Service: AI-Powered Insights",
      excerpt: "Discover how artificial intelligence is transforming the customer service landscape...",
      author: "Sarah Chen",
      date: "March 15, 2024",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80",
      category: "Technology"
    },
    {
      title: "5 Ways to Improve Customer Call Quality",
      excerpt: "Learn the best practices for enhancing your customer service calls...",
      author: "Michael Rodriguez",
      date: "March 10, 2024",
      image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80",
      category: "Best Practices"
    },
    {
      title: "Understanding Call Analytics: A Complete Guide",
      excerpt: "A comprehensive guide to understanding and utilizing call analytics...",
      author: "Emily Thompson",
      date: "March 5, 2024",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80",
      category: "Analytics"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero
          title="Latest Updates"
          description="Insights, news, and best practices from the CallQA team"
          backgroundImage="https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&q=80"
          textAlignment="center"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-sm text-brand-primary font-medium mb-2">
                    {post.category}
                  </div>
                  <h2 className="text-xl font-semibold mb-3 text-brand-dark">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {post.date}
                      </div>
                    </div>
                    <button className="text-brand-primary hover:text-brand-secondary flex items-center">
                      Read more
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}