
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Leaf } from 'lucide-react';
import { toast } from 'sonner';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    zoneId: '',
    truckNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    if (formData.role === 'driver' && !formData.truckNumber) {
      toast.error('Truck number is required for drivers');
      return;
    }

    setLoading(true);

    try {
      await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.zoneId,
        formData.truckNumber
      );
      
      toast.success('Account created successfully');
      
      // Navigate based on role
      switch (formData.role) {
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
    } catch (error) {
      toast.error('Failed to create account');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up - CleanConnect</title>
        <meta name="description" content="Create your CleanConnect account to start managing waste efficiently" />
      </Helmet>

      <div className="min-h-screen bg-background-dark flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-green rounded-2xl mb-4">
              <Leaf className="w-8 h-8 text-background-dark" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Join CleanConnect</h1>
            <p className="text-muted-foreground">Create your account to get started</p>
          </div>

          <div className="bg-background-darker rounded-2xl p-8 border border-border">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-foreground mb-2 block">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Anika Sharma"
                  required
                  className="bg-background-dark border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-foreground mb-2 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="anika.sharma@example.com"
                  required
                  className="bg-background-dark border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-foreground mb-2 block">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger className="bg-background-dark border-border text-foreground">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="citizen">Citizen</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'driver' && (
                <div>
                  <Label htmlFor="truckNumber" className="text-foreground mb-2 block">Truck Number</Label>
                  <Input
                    id="truckNumber"
                    type="text"
                    value={formData.truckNumber}
                    onChange={(e) => handleChange('truckNumber', e.target.value)}
                    placeholder="TRK-001"
                    required
                    className="bg-background-dark border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="zoneId" className="text-foreground mb-2 block">Zone ID (Optional)</Label>
                <Input
                  id="zoneId"
                  type="text"
                  value={formData.zoneId}
                  onChange={(e) => handleChange('zoneId', e.target.value)}
                  placeholder="ZONE-A1"
                  className="bg-background-dark border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-foreground mb-2 block">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  required
                  minLength={8}
                  className="bg-background-dark border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-foreground mb-2 block">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="bg-background-dark border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-green text-background-dark hover:bg-accent-green-dark disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-accent-green hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
