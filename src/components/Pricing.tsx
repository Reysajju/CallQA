import React, { useState } from 'react';
import { Check, HelpCircle, Calculator } from 'lucide-react';
import { cn } from '../lib/utils';
import { SUBSCRIPTION_PRICES, formatPKR } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Plan {
  id: keyof typeof SUBSCRIPTION_PRICES;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  trial?: string;
}

const plans: Plan[] = [
  {
    id: 'startup',
    name: "Startup",
    price: SUBSCRIPTION_PRICES.startup,
    description: "Perfect for startups and small teams",
    features: [
      "500 monthly minutes included",
      "Basic analytics dashboard",
      "Email support",
      "File upload up to 100MB",
      "14-day free trial"
    ],
    buttonText: "Start Free Trial",
    trial: "14 days"
  },
  {
    id: 'small_business',
    name: "Small Business",
    price: SUBSCRIPTION_PRICES.small_business,
    description: "Ideal for growing businesses",
    features: [
      "2,000 monthly minutes",
      "Advanced analytics",
      "Priority support",
      "File upload up to 500MB",
      "Team collaboration tools",
      "API access"
    ],
    popular: true,
    buttonText: "Start Free Trial",
    trial: "14 days"
  },
  {
    id: 'enterprise',
    name: "Enterprise",
    price: SUBSCRIPTION_PRICES.enterprise,
    description: "For large organizations",
    features: [
      "Unlimited minutes",
      "Custom analytics",
      "24/7 dedicated support",
      "Unlimited file storage",
      "Advanced security features",
      "Custom integration options"
    ],
    buttonText: "Contact Sales"
  }
];

export function Pricing() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    navigate('/auth/signup', { state: { plan: planId } });
  };

  return (
    <div className="bg-white py-24" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that best fits your needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative bg-white rounded-xl border transition-all duration-200",
                plan.popular
                  ? "border-brand-primary shadow-lg scale-105"
                  : "border-gray-200 hover:border-brand-primary hover:shadow-md"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-brand-primary text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-2xl font-bold text-brand-dark mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-6">
                  <div className="text-4xl font-bold text-brand-dark">
                    {formatPKR(plan.price)}
                    <span className="text-lg font-normal text-gray-500">/month</span>
                  </div>
                  {plan.trial && (
                    <div className="text-sm text-brand-accent mt-2">
                      {plan.trial} free trial included
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-brand-primary flex-shrink-0 mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-semibold transition-colors duration-200",
                    plan.popular
                      ? "bg-brand-primary text-white hover:bg-brand-secondary"
                      : "bg-brand-light text-brand-primary hover:bg-brand-primary hover:text-white"
                  )}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-brand-dark text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            {[
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, bank transfers, and online payment methods available in Pakistan."
              },
              {
                q: "Can I change my plan later?",
                a: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
              },
              {
                q: "What happens after the trial period?",
                a: "After your trial ends, you'll be automatically subscribed to your chosen plan. We'll notify you before the trial ends."
              },
              {
                q: "Is there a long-term contract?",
                a: "No, all our plans are month-to-month with no long-term commitment required."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-brand-light rounded-lg p-6">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="w-5 h-5 text-brand-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-brand-dark mb-2">{faq.q}</h4>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}