
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.model);
    }
    setInitialLoading(false);
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
    setCurrentUser(authData.record);
    return authData.record;
  };

  const signup = async (email, password, name, role, zoneId = '', truckNumber = '') => {
    // Create user account
    const userData = {
      email,
      password,
      passwordConfirm: password,
      name,
      role,
      zone_id: zoneId,
      truck_number: truckNumber
    };

    const user = await pb.collection('users').create(userData, { $autoCancel: false });

    // Auto-login after signup
    await login(email, password);

    // Create role-specific record
    if (role === 'citizen') {
      await pb.collection('citizens').create({
        user_id: user.id,
        green_tokens: 0,
        zone_id: zoneId || 'zone_default',
        neighborhood: '',
        geolocation: '',
        next_pickup_date: '',
        next_pickup_time: ''
      }, { $autoCancel: false });
    } else if (role === 'driver') {
      await pb.collection('drivers').create({
        user_id: user.id,
        truck_number: truckNumber || 'TRK-000',
        base_daily_wage: 500,
        current_strikes: 0,
        wallet_balance: 0,
        assigned_zones: zoneId || ''
      }, { $autoCancel: false });
    }

    return user;
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
    navigate('/');
  };

  const updateProfile = async (userId, data) => {
    const updated = await pb.collection('users').update(userId, data, { $autoCancel: false });
    setCurrentUser(updated);
    return updated;
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: pb.authStore.isValid
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="text-accent-green text-xl">Loading CleanConnect...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
