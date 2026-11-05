
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import Header from '@/components/Header.jsx';
import BinQRDisplay from '@/components/BinQRDisplay.jsx';
import { User, Mail, Shield, MapPin, Truck, History, Award, QrCode, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { calculateTier } from '@/lib/civicScoreUtils.js';

const ProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [civicScoreData, setCivicScoreData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.role === 'citizen') {
      fetchCivicScore();
    }
  }, [currentUser]);

  const fetchCivicScore = async () => {
    try {
      const scores = await pb.collection('civic_scores').getFullList({
        filter: `citizen_id = "${currentUser.id}"`,
        $autoCancel: false
      });
      if (scores.length > 0) {
        setCivicScoreData(scores[0]);
      } else {
        setCivicScoreData({ current_score: 300, tier_rank: 'Eco-Novice' });
      }
    } catch (e) {
      console.error('Error fetching civic score:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(currentUser.id, { name });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-warning-orange/10 text-warning-orange border-warning-orange/20';
      case 'driver':
        return 'bg-accent-green/10 text-accent-green border-accent-green/20';
      case 'citizen':
        return 'bg-success-green/10 text-success-green border-success-green/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTierColor = (tier) => {
    if (tier === 'Elite Guardian') return 'text-civic-guardian bg-civic-guardian/10';
    if (tier === 'Civic Champion') return 'text-civic-champion bg-civic-champion/10';
    return 'text-civic-novice bg-civic-novice/10';
  };

  return (
    <>
      <Helmet>
        <title>Profile - CleanConnect</title>
        <meta name="description" content="Manage your CleanConnect profile settings" />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background-dark py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>
                Account Overview
              </h1>
              <p className="text-muted-foreground">Manage your settings and integrations</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="bg-background-darker border border-border p-1 w-full justify-start h-auto flex-wrap mb-8">
              <TabsTrigger value="profile" className="data-[state=active]:bg-background-dark data-[state=active]:text-foreground rounded-lg py-2.5 px-4 flex items-center">
                <User className="w-4 h-4 mr-2" /> General Info
              </TabsTrigger>
              {currentUser?.role === 'citizen' && (
                <TabsTrigger value="qr" className="data-[state=active]:bg-background-dark data-[state=active]:text-foreground rounded-lg py-2.5 px-4 flex items-center">
                  <QrCode className="w-4 h-4 mr-2" /> My Dustbin QR
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 bg-background-darker rounded-2xl p-8 border border-border">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 bg-accent-green rounded-2xl flex items-center justify-center shadow-lg">
                      <User className="w-10 h-10 text-background-dark" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{currentUser?.name}</h2>
                      <Badge variant="outline" className={getRoleBadgeColor(currentUser?.role)}>
                        {currentUser?.role}
                      </Badge>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-foreground mb-2 block">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background-dark border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-foreground mb-2 block">Email</Label>
                      <div className="flex items-center gap-3 bg-background-dark border border-border rounded-lg px-4 py-3 opacity-70">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span className="text-foreground">{currentUser?.email}</span>
                      </div>
                    </div>

                    {currentUser?.zone_id && (
                      <div>
                        <Label htmlFor="zone" className="text-foreground mb-2 block">Zone Assignment</Label>
                        <div className="flex items-center gap-3 bg-background-dark border border-border rounded-lg px-4 py-3 opacity-70">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <span className="text-foreground">{currentUser.zone_id}</span>
                        </div>
                      </div>
                    )}

                    {currentUser?.truck_number && (
                      <div>
                        <Label htmlFor="truck" className="text-foreground mb-2 block">Truck Number</Label>
                        <div className="flex items-center gap-3 bg-background-dark border border-border rounded-lg px-4 py-3 opacity-70">
                          <Truck className="w-5 h-5 text-muted-foreground" />
                          <span className="text-foreground">{currentUser.truck_number}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-accent-green text-background-dark hover:bg-accent-green-dark disabled:opacity-50 transition-transform active:scale-[0.98]"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </div>

                {currentUser?.role === 'citizen' && civicScoreData && (
                  <div className="md:col-span-1 space-y-6">
                    <div className="bg-background-darker rounded-2xl p-6 border border-border flex flex-col justify-center items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                        <Award className={`w-8 h-8 ${getTierColor(civicScoreData.tier_rank).split(' ')[0]}`} />
                      </div>
                      <h3 className="text-lg font-medium text-muted-foreground mb-1">Civic Score</h3>
                      <p className="text-5xl font-bold text-foreground mb-3 tracking-tighter" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {civicScoreData.current_score}
                      </p>
                      <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getTierColor(civicScoreData.tier_rank)}`}>
                        {civicScoreData.tier_rank}
                      </div>
                    </div>
                    
                    <Link to="/civic-ledger" className="block w-full">
                      <Button variant="outline" className="w-full border-border text-foreground hover:bg-muted transition-transform active:scale-[0.98]">
                        <History className="w-4 h-4 mr-2" />
                        View Score History
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </TabsContent>

            {currentUser?.role === 'citizen' && (
              <TabsContent value="qr" className="mt-0">
                <div className="mb-6 bg-accent-green/5 border border-accent-green/20 rounded-xl p-4">
                  <p className="text-accent-green text-sm flex items-center">
                    <ShieldCheck className="w-5 h-5 mr-2 shrink-0" />
                    Share this QR code with your neighborhood or print it on your bin. Daily successful scans by the driver earn you 15 Civic Points.
                  </p>
                </div>
                <BinQRDisplay citizenId={currentUser.id} userData={currentUser} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
