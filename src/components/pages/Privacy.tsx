import React from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Shield } from 'lucide-react';
import { Hero } from '../Hero';

export function Privacy() {
  const sections = [
    {
      title: "Information We Collect",
      content: `We collect information that you provide directly to us, including:
        • Personal information (name, email, phone number)
        • Company information
        • Audio recordings and transcripts
        • Usage data and analytics`
    },
    {
      title: "How We Use Your Information",
      content: `We use the collected information for:
        • Providing and improving our services
        • Analyzing and enhancing call quality
        • Generating insights and recommendations
        • Communication and support
        • Legal compliance`
    },
    {
      title: "Data Security",
      content: `We implement appropriate technical and organizational measures to protect your data:
        • End-to-end encryption
        • Regular security audits
        • Access controls
        • Secure data centers`
    },
    {
      title: "Data Retention",
      content: `We retain your information for as long as:
        • Your account is active
        • Necessary to provide our services
        • Required by law
        You can request data deletion at any time.`
    },
    {
      title: "Your Rights",
      content: `You have the right to:
        • Access your data
        • Correct inaccurate data
        • Request data deletion
        • Object to processing
        • Data portability`
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero
          title="Privacy Policy"
          description="We are committed to protecting your privacy and ensuring the security of your data"
          backgroundImage="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80"
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
              <p className="text-gray-600 mb-12">
                This Privacy Policy describes how CallQA ("we", "our", or "us") collects, uses, and
                shares your personal information when you use our services.
              </p>

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
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <ul className="mt-4 space-y-2">
                  <li>Email: privacy@callqa.com</li>
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