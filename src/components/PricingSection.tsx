import React from 'react';
import { Check } from 'lucide-react';
import { PRICING_TIERS } from '../lib/pricing';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export function PricingSection() {
  const handleSubscribe = async (tier: 'pro' | 'enterprise') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const { data: { session }, error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: `${window.location.origin}/pricing`
          }
        });

        if (authError) throw authError;
        if (!session) return; // User needs to complete authentication
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          priceId: tier === 'pro' ? 'price_pro' : 'price_enterprise',
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/pricing`
        })
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to start subscription:', error);
    }
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600">Choose the plan that best fits your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {Object.entries(PRICING_TIERS).map(([key, tier]) => (
            <div
              key={key}
              className={`bg-white rounded-2xl shadow-xl p-8 ${
                key === 'pro' ? 'border-2 border-blue-500 relative' : ''
              }`}
            >
              {key === 'pro' && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-gray-900 mb-4">{tier.name}</h3>
              
              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-900">
                  {key === 'free' ? 'Free' : key === 'pro' ? '$49' : 'Custom'}
                </p>
                {key !== 'free' && key !== 'enterprise' && (
                  <p className="text-gray-600">/month</p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Usage Limits</p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-600">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      {tier.limits.audioMinutes === -1 ? 'Unlimited' : `${tier.limits.audioMinutes} minutes`} audio/month
                    </li>
                    <li className="flex items-center text-gray-600">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      {tier.limits.analysisPerMonth === -1 ? 'Unlimited' : `${tier.limits.analysisPerMonth}`} analyses/month
                    </li>
                    <li className="flex items-center text-gray-600">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      {tier.limits.chatQuestionsPerDay === -1 ? 'Unlimited' : `${tier.limits.chatQuestionsPerDay}`} chat questions/day
                    </li>
                    <li className="flex items-center text-gray-600">
                      <Check className="w-5 h-5 text-green-500 mr-2" />
                      Up to {tier.limits.maxFileSize}MB files
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Features</p>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <Check className="w-5 h-5 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {key !== 'free' && (
                <button
                  onClick={() => handleSubscribe(key as 'pro' | 'enterprise')}
                  className={`w-full py-3 px-6 rounded-lg font-medium ${
                    key === 'pro'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } transition-colors`}
                >
                  {key === 'enterprise' ? 'Contact Sales' : 'Subscribe Now'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}