import React from 'react';
import { FileAudio, Github, Twitter, Linkedin, Mail, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { scrollToTop } from '../lib/utils';

export function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    if (path.startsWith('#')) {
      const element = document.querySelector(path);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(path);
      scrollToTop();
    }
  };

  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileAudio className="w-6 h-6 text-brand-primary" />
              <span className="text-xl font-bold">CallQA</span>
            </div>
            <p className="text-gray-400">
              Transform your customer service with AI-powered call analysis
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#features" 
                  onClick={(e) => handleNavigation(e, '#features')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="#pricing" 
                  onClick={(e) => handleNavigation(e, '#pricing')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  API
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Release Notes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/about"
                  onClick={(e) => handleNavigation(e, '/about')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="/customers"
                  onClick={(e) => handleNavigation(e, '/customers')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Customers
                </a>
              </li>
              <li>
                <a 
                  href="/blog"
                  onClick={(e) => handleNavigation(e, '/blog')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="/careers"
                  onClick={(e) => handleNavigation(e, '/careers')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a 
                  href="/press-kit"
                  onClick={(e) => handleNavigation(e, '/press-kit')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Press Kit
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact & Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:sajjjad.rasool@gmail.com" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>sajjjad.rasool@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+923142834340" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+92 314 2834340</span>
                </a>
              </li>
              <li>
                <a 
                  href="/privacy"
                  onClick={(e) => handleNavigation(e, '/privacy')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="/terms"
                  onClick={(e) => handleNavigation(e, '/terms')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="/security"
                  onClick={(e) => handleNavigation(e, '/security')}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-center md:text-left text-gray-400">
              © {new Date().getFullYear()} CallQA. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Status
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Accessibility
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Settings
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}