import React from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { FileText } from 'lucide-react';
import { Hero } from '../Hero';

export function Terms() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing and using CallQA's services, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.`
    },
    {
      title: "2. Use License",
      content: `Subject to these Terms of Service, CallQA grants you a limited, non-exclusive, non-transferable license to use our services for your internal business purposes.`
    },
    {
      title: "3. Service Availability",
      content: `We strive to provide uninterrupted service but may need to perform maintenance or updates. We are not liable for any service interruptions or data loss.`
    },
    {
      title: "4. User Obligations",
      content: `You agree to:
        • Provide accurate information
        • Maintain the security of your account
        • Comply with all applicable laws
        • Not misuse our services
        • Not infringe on others' rights`
    },
    {
      title: "5. Payment Terms",
      content: `• Payment is required for continued service access
        • Prices are subject to change with notice
        • Refunds are provided according to our refund policy
        • Late payments may result in service suspension`
    },
    {
      title: "6. Intellectual Property",
      content: `All content, features, and functionality are owned by CallQA and are protected by international copyright, trademark, and other intellectual property laws.`
    },
    {
      title: "7. Limitation of Liability",
      content: `CallQA shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.`
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero
          title="Terms of Service"
          description="Please read these terms carefully before using CallQA's services"
          backgroundImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80"
          textAlignment="center"
        >
          <p className="text-gray-400 mt-4">
            Last updated: March 15, 2024
          </p>
        </Hero>

        {/* Content */}
        <div className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              {sections.map((section, index) => (
                <div key={index} className="mb-12 last:mb-0">
                  <h2 className="text-2xl font-bold text-brand-dark mb-4">
                    {section.title}
                  </h2>
                  <div className="bg-brand-light rounded-lg p-6">
                    <p className="text-gray-600 whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              ))}

              <div className="mt-12 p-6 bg-brand-dark text-white rounded-lg">
                <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <ul className="mt-4 space-y-2">
                  <li>Email: legal@callqa.com</li>
                  <li>Phone: +92 314 2834340</li>
                  <li>Address: Karachi, Pakistan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}