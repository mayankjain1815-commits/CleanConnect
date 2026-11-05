
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Bell, BookOpen, Shield, LogOut } from 'lucide-react';

const SettingsPage = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Helmet>
        <title>Settings - CleanConnect</title>
        <meta name="description" content="Manage your CleanConnect settings and preferences" />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background-dark py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your preferences and account settings</p>
          </div>

          <div className="space-y-4">
            <div className="bg-background-darker rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6 text-accent-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Manage notification preferences</p>
                  </div>
                </div>
                <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                  Configure
                </Button>
              </div>
            </div>

            <div className="bg-background-darker rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-accent-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Onboarding Tutorial</h3>
                    <p className="text-sm text-muted-foreground">Review the platform walkthrough</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/onboarding')}
                  className="border-border text-foreground hover:bg-muted"
                >
                  View Tutorial
                </Button>
              </div>
            </div>

            <div className="bg-background-darker rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Role Information</h3>
                    <p className="text-sm text-muted-foreground">Current role: {currentUser?.role}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background-darker rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-warning-orange/10 rounded-xl flex items-center justify-center">
                    <LogOut className="w-6 h-6 text-warning-orange" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Logout</h3>
                    <p className="text-sm text-muted-foreground">Sign out of your account</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-warning-orange text-warning-orange hover:bg-warning-orange/10"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
