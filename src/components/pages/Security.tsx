import React from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Shield, Lock, Key, Server, Database, Users } from 'lucide-react';
import { Hero } from '../Hero';

export function Security() {
  const features = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard protocols"
    },
    {
      icon: Key,
      title: "Access Control",
      description: "Role-based access control with multi-factor authentication"
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "Hosted in SOC 2 compliant data centers with 24/7 monitoring"
    },
    {
      icon: Database,
      title: "Data Protection",
      description: "Regular backups and disaster recovery procedures"
    },
    {
      icon: Shield,
      title: "Compliance",
      description: "Adherence to international security standards and regulations"
    },
    {
      icon: Users,
      title: "Security Team",
      description: "Dedicated security professionals monitoring and improving our systems"
    }
  ];

  const certifications = [
    "ISO 27001",
    "SOC 2 Type II",
    "GDPR Compliant",
    "HIPAA Compliant"
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main>
        <Hero
          title="Security at CallQA"
          description="Your security is our top priority. Learn about our comprehensive approach to protecting your data and privacy."
          backgroundImage="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80"
          textAlignment="center"
        />

        {/* Security Features */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-12 text-center">
              Enterprise-Grade Security
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <feature.icon className="w-12 h-12 text-brand-primary mb-4" />
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-brand-light py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-12 text-center">
              Certifications & Compliance
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {certifications.map((cert, index) => (
                <div key={index} className="bg-white p-6 rounded-lg text-center border border-gray-200">
                  <Shield className="w-12 h-12 text-brand-primary mx-auto mb-4" />
                  <p className="font-semibold text-brand-dark">{cert}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Practices */}
        <div className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-12 text-center">
              Our Security Practices
            </h2>
            
            <div className="space-y-8">
              {[
                {
                  title: "Regular Security Audits",
                  content: "We conduct regular internal and external security audits to identify and address potential vulnerabilities."
                },
                {
                  title: "Incident Response",
                  content: "Our dedicated security team is available 24/7 to respond to and address any security incidents."
                },
                {
                  title: "Employee Training",
                  content: "All employees undergo regular security awareness training and follow strict security protocols."
                },
                {
                  title: "Vendor Assessment",
                  content: "We carefully evaluate and monitor all third-party vendors to ensure they meet our security standards."
                }
              ].map((practice, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-semibold text-brand-dark mb-2">
                    {practice.title}
                  </h3>
                  <p className="text-gray-600">
                    {practice.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-brand-dark text-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">Have Security Concerns?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Our security team is here to help
            </p>
            <div className="inline-flex space-x-4">
              <a
                href="mailto:security@callqa.com"
                className="bg-brand-primary hover:bg-brand-secondary text-white px-6 py-3 rounded-lg transition-colors"
              >
                Contact Security Team
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Report Vulnerability
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}