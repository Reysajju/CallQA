import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthLayout } from './components/auth/AuthLayout';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FileUpload } from './components/FileUpload';
import { About } from './components/pages/About';
import { Customers } from './components/pages/Customers';
import { Blog } from './components/pages/Blog';
import { Careers } from './components/pages/Careers';
import { PressKit } from './components/pages/PressKit';
import { Privacy } from './components/pages/Privacy';
import { Terms } from './components/pages/Terms';
import { Security } from './components/pages/Security';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-brand-dark">
              <Navbar />
              <div className="relative h-screen">
                <div className="absolute inset-0 overflow-hidden">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    poster="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?auto=format&fit=crop&q=80"
                  >
                    <source
                      src="https://cdn.coverr.co/videos/coverr-typing-on-computer-keyboard-2584/1080p.mp4"
                      type="video/mp4"
                    />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand-dark/70" />
                </div>
                <div className="relative h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
                    <div className="text-center">
                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Transform Your <span className="text-brand-primary">Customer Service</span>
                        <br />with AI-Powered Insights
                      </h1>
                      <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
                        Analyze customer calls instantly, get quality scores, and actionable feedback.
                      </p>
                      <div className="mt-10 flex justify-center space-x-4">
                        <a
                          href="/auth/signup"
                          className="px-8 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-all duration-200 transform hover:scale-105"
                        >
                          Get Started
                        </a>
                        <a
                          href="#features"
                          className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200"
                        >
                          Learn More
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Features />
              <Testimonials />
              <Pricing />
              <Footer />
            </div>
          }
        />

        {/* Static Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/press-kit" element={<PressKit />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/security" element={<Security />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginForm />} />
          <Route path="signup" element={<SignupForm />} />
          <Route path="forgot-password" element={<ForgotPasswordForm />} />
          <Route index element={<Navigate to="/auth/login" replace />} />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/upload"
          element={
            <div className="min-h-screen bg-brand-light">
              <Navbar />
              <div className="max-w-4xl mx-auto px-4 py-24">
                <FileUpload onFileSelect={(file) => console.log('File selected:', file)} />
              </div>
              <Footer />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;