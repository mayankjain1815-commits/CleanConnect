
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Leaf, LogOut, User, Settings, HelpCircle } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getDashboardPath = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'citizen':
        return '/citizen-dashboard';
      case 'driver':
        return '/driver-dashboard';
      case 'admin':
        return '/admin-panel';
      default:
        return '/';
    }
  };

  const getInstructionsPath = () => {
    if (!currentUser) return '/instructions/citizen';
    switch (currentUser.role) {
      case 'driver':
        return '/instructions/driver';
      case 'admin':
        return '/instructions/admin';
      case 'citizen':
      default:
        return '/instructions/citizen';
    }
  };

  return (
    <header className="bg-background-darker border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent-green rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-background-dark" />
            </div>
            <span className="text-xl font-bold text-foreground">CleanConnect</span>
          </Link>

          <nav className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-foreground hover:text-accent-green">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-accent-green text-background-dark hover:bg-accent-green-dark">
                    Sign Up
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to={getDashboardPath()}>
                  <Button
                    variant={isActive(getDashboardPath()) ? 'default' : 'ghost'}
                    className={isActive(getDashboardPath()) ? 'bg-accent-green text-background-dark' : 'text-foreground hover:text-accent-green'}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to={getInstructionsPath()}>
                  <Button
                    variant={isActive(getInstructionsPath()) ? 'default' : 'ghost'}
                    className={isActive(getInstructionsPath()) ? 'bg-accent-green text-background-dark' : 'text-foreground hover:text-accent-green'}
                    title="Role-specific instructions"
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span className="hidden sm:inline ml-2">Instructions</span>
                  </Button>
                </Link>
                <Link to="/profile">
                  <Button variant="ghost" size="icon" className="text-foreground hover:text-accent-green">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" size="icon" className="text-foreground hover:text-accent-green">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-foreground hover:text-warning-orange"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
