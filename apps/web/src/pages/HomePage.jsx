
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Leaf, Calendar, Coins, TrendingUp, MapPin, Shield, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>CleanConnect - Smart Waste Management for Sustainable Cities</title>
        <meta name="description" content="Transform urban waste collection with AI-powered verification, green token rewards, and real-time route optimization" />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background-dark">
        <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.unsplash.com/photo-1608476524605-2ad765c3bd78"
              alt="Modern waste management infrastructure"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/80 to-background-dark"></div>

          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-green rounded-2xl mb-8">
              <Leaf className="w-10 h-10 text-background-dark" />
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight" style={{ letterSpacing: '-0.02em' }}>
              Smart waste management for sustainable cities
            </h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform urban waste collection with AI-powered verification, green token rewards, and real-time route optimization
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-accent-green text-background-dark hover:bg-accent-green-dark text-lg px-8 py-6">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-border text-foreground hover:bg-muted text-lg px-8 py-6">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
                Built for every stakeholder
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Role-specific features designed to optimize waste management across the entire ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div className="order-2 md:order-1">
                <div className="bg-background-darker rounded-2xl p-8 border border-border">
                  <div className="w-14 h-14 bg-success-green/10 rounded-xl flex items-center justify-center mb-6">
                    <Coins className="w-7 h-7 text-success-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">For Citizens</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Earn 50 green tokens for each verified waste segregation. Track collection schedules, submit complaints, and redeem rewards for electricity bill discounts and grocery vouchers.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2"></div>
                      <span className="text-foreground">One-tap verification with camera module</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2"></div>
                      <span className="text-foreground">Real-time collection countdown timer</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2"></div>
                      <span className="text-foreground">Direct complaint submission portal</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-square bg-gradient-to-br from-success-green/20 to-accent-green/20 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-32 h-32 text-accent-green" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <div className="aspect-square bg-gradient-to-br from-accent-green/20 to-success-green/20 rounded-2xl flex items-center justify-center">
                  <MapPin className="w-32 h-32 text-accent-green" />
                </div>
              </div>
              <div>
                <div className="bg-background-darker rounded-2xl p-8 border border-border">
                  <div className="w-14 h-14 bg-accent-green/10 rounded-xl flex items-center justify-center mb-6">
                    <TrendingUp className="w-7 h-7 text-accent-green" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">For Drivers</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Navigate optimized routes with interactive maps showing priority bins. Track performance metrics and real-time salary adjustments based on route completion.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2"></div>
                      <span className="text-foreground">Color-coded bin priority system</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2"></div>
                      <span className="text-foreground">QR code verification at each bin</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2"></div>
                      <span className="text-foreground">Performance-based wage tracking</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="bg-background-darker rounded-2xl p-8 border border-border">
                  <div className="w-14 h-14 bg-warning-orange/10 rounded-xl flex items-center justify-center mb-6">
                    <Shield className="w-7 h-7 text-warning-orange" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">For Administrators</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Monitor city-wide operations with ghost-scheduled area heatmaps, financial analytics, and smart bin monitoring. Make data-driven decisions to optimize collection efficiency.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2"></div>
                      <span className="text-foreground">Real-time fund leakage tracking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2"></div>
                      <span className="text-foreground">Ultrasonic sensor data visualization</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-accent-green rounded-full mt-2"></div>
                      <span className="text-foreground">Driver performance management</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-square bg-gradient-to-br from-warning-orange/20 to-accent-green/20 rounded-2xl flex items-center justify-center">
                  <Shield className="w-32 h-32 text-accent-green" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 bg-gradient-to-b from-background-dark to-background-darker">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6" style={{ letterSpacing: '-0.02em' }}>
              Ready to transform your city's waste management?
            </h2>
            <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
              Join CleanConnect today and be part of the sustainable urban future
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-accent-green text-background-dark hover:bg-accent-green-dark text-lg px-8 py-6">
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="border-border text-foreground hover:bg-muted text-lg px-8 py-6">
                  Login to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <footer className="bg-background-darker border-t border-border py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-accent-green rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-background-dark" />
                </div>
                <span className="text-xl font-bold text-foreground">CleanConnect</span>
              </div>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2026 CleanConnect. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
