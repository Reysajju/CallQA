import React from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Download, FileText, Image, Package } from 'lucide-react';
import { Hero } from '../Hero';

export function PressKit() {
  const resources = [
    {
      title: "Brand Guidelines",
      description: "Our complete brand style guide including logo usage, typography, and color palette",
      icon: FileText,
      downloadUrl: "#"
    },
    {
      title: "Logo Package",
      description: "High-resolution logos in various formats (PNG, SVG, AI)",
      icon: Image,
      downloadUrl: "#"
    },
    {
      title: "Media Kit",
      description: "Product screenshots, team photos, and office images",
      icon: Package,
      downloadUrl: "#"
    }
  ];

  const facts = [
    {
      label: "Founded",
      value: "2023"
    },
    {
      label: "Headquarters",
      value: "Karachi, Pakistan"
    },
    {
      label: "Team Size",
      value: "50+"
    },
    {
      label: "Customers",
      value: "1000+"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero
          title="Press Kit"
          description="Everything you need to tell the CallQA story"
          backgroundImage="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80"
          textAlignment="left"
        />

        {/* Company Facts */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-12">Company Facts</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {facts.map((fact, index) => (
                <div key={index} className="bg-brand-light p-6 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{fact.label}</div>
                  <div className="text-2xl font-bold text-brand-dark">{fact.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Assets */}
        <div className="bg-brand-light py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-12">Brand Assets</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {resources.map((resource, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <resource.icon className="w-8 h-8 text-brand-primary mb-4" />
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {resource.description}
                  </p>
                  <button className="inline-flex items-center text-brand-primary hover:text-brand-secondary">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-8">Media Contact</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-4">
                For press inquiries, please contact:
              </p>
              <div className="space-y-2">
                <p className="font-medium">Press Team</p>
                <p>Email: press@callqa.com</p>
                <p>Phone: +92 314 2834340</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}