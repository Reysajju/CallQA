import React, { useState } from 'react';
import { FileAudio, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FileAudio className="w-8 h-8 text-brand-primary" />
            <span className="text-xl font-bold text-brand-dark">CallQA</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-brand-primary transition-colors">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-brand-primary transition-colors">Testimonials</a>
            <a href="#pricing" className="text-gray-600 hover:text-brand-primary transition-colors">Pricing</a>
            <button
              onClick={handleGetStarted}
              className="px-4 py-2 text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-brand-primary"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 top-16 bg-white border-b border-gray-200 transition-all duration-200 transform",
          mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        )}
      >
        <div className="p-4 space-y-4">
          <a
            href="#features"
            className="block px-4 py-2 text-gray-600 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="block px-4 py-2 text-gray-600 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Testimonials
          </a>
          <a
            href="#pricing"
            className="block px-4 py-2 text-gray-600 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Pricing
          </a>
          <button
            className="w-full px-4 py-2 text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors"
            onClick={() => {
              setMobileMenuOpen(false);
              handleGetStarted();
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}