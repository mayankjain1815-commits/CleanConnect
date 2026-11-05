
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Coins, Users, X } from 'lucide-react';

const OnboardingDemo = () => {
  const [step, setStep] = useState(1);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    switch (currentUser?.role) {
      case 'citizen':
        navigate('/citizen-dashboard');
        break;
      case 'driver':
        navigate('/driver-dashboard');
        break;
      case 'admin':
        navigate('/admin-panel');
        break;
      default:
        navigate('/');
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return {
          icon: <Calendar className="w-16 h-16 text-accent-green" />,
          title: 'Collection schedules and zone assignments',
          description: currentUser?.role === 'citizen' 
            ? 'Your waste collection is scheduled based on your zone. Check your dashboard for the next pickup date and time. Make sure to segregate your waste before collection.'
            : currentUser?.role === 'driver'
            ? 'You are assigned specific zones for waste collection. Follow the optimized route on your dashboard and scan QR codes at each bin to confirm collection.'
            : 'Manage zone assignments and collection schedules for all areas. Monitor real-time collection status and optimize routes for maximum efficiency.'
        };
      case 2:
        return {
          icon: <Coins className="w-16 h-16 text-accent-green" />,
          title: 'Green token earning mechanics',
          description: currentUser?.role === 'citizen'
            ? 'Earn 50 green tokens for each verified waste segregation. Upload a photo of your properly segregated waste through the verification module. Tokens can be redeemed for electricity bill discounts and grocery vouchers.'
            : currentUser?.role === 'driver'
            ? 'Your performance is tracked through route completion. Complete all assigned routes on time to avoid strikes. Each strike results in a 15% wage deduction from your daily pay.'
            : 'Monitor the green token economy and driver performance metrics. Track fund savings from automated salary deductions and citizen engagement through token redemptions.'
        };
      case 3:
        return {
          icon: <Users className="w-16 h-16 text-accent-green" />,
          title: 'Role-specific features',
          description: currentUser?.role === 'citizen'
            ? 'Access your personalized dashboard to view collection schedules, submit complaints, verify waste segregation, and redeem rewards. Track your green token balance and contribution to a cleaner city.'
            : currentUser?.role === 'driver'
            ? 'Use the interactive map to navigate your route, scan bin QR codes for verification, and monitor your performance tracker. View your real-time salary adjustments and route history.'
            : 'Access comprehensive analytics including ghost-scheduled area heatmaps, financial leakage tracking, smart bin monitoring, and driver performance management. Make data-driven decisions to optimize city-wide waste collection.'
        };
      default:
        return { icon: null, title: '', description: '' };
    }
  };

  const content = getStepContent();
  const progress = (step / totalSteps) * 100;

  return (
    <>
      <Helmet>
        <title>Welcome to CleanConnect - Onboarding</title>
        <meta name="description" content="Learn how to use CleanConnect waste management platform" />
      </Helmet>

      <div className="min-h-screen bg-background-dark flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          <div className="bg-background-darker rounded-2xl p-8 border border-border relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
                <span className="text-sm text-accent-green">{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-6">
                {content.icon}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4" style={{ letterSpacing: '-0.02em' }}>
                {content.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-prose mx-auto">
                {content.description}
              </p>
            </div>

            <div className="flex gap-4">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 border-border text-foreground hover:bg-muted"
                >
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 bg-accent-green text-background-dark hover:bg-accent-green-dark"
              >
                {step === totalSteps ? 'Get Started' : 'Next'}
              </Button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                Skip tutorial
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingDemo;
