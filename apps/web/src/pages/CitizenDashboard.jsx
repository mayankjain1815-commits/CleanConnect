
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import CameraModule from '@/components/CameraModule';
import ComplaintModal from '@/components/ComplaintModal';
import RewardsCard from '@/components/RewardsCard';
import CivicScoreArc from '@/components/CivicScoreArc';
import { updateCivicScore } from '@/lib/civicScoreUtils';
import { Calendar, Camera, MessageSquare, Coins, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';

const CitizenDashboard = () => {
  const { currentUser } = useAuth();
  const [citizenData, setCitizenData] = useState(null);
  const [civicScoreData, setCivicScoreData] = useState({ current_score: 300, tier_rank: 'Eco-Novice' });
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [timeUntilPickup, setTimeUntilPickup] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (citizenData?.next_pickup_date && citizenData?.next_pickup_time) {
      const interval = setInterval(() => {
        calculateTimeUntilPickup();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [citizenData]);

  const fetchData = async () => {
    try {
      const citizens = await pb.collection('citizens').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        $autoCancel: false
      });

      if (citizens.length > 0) {
        setCitizenData(citizens[0]);
        
        // Fetch civic score
        const scores = await pb.collection('civic_scores').getFullList({
          filter: `citizen_id = "${currentUser.id}"`,
          $autoCancel: false
        });
        
        if (scores.length > 0) {
          setCivicScoreData(scores[0]);
        }
      }

      const rewardsList = await pb.collection('rewards').getFullList({ $autoCancel: false });
      setRewards(rewardsList);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeUntilPickup = () => {
    if (!citizenData?.next_pickup_date || !citizenData?.next_pickup_time) return;

    const pickupDateTime = new Date(`${citizenData.next_pickup_date} ${citizenData.next_pickup_time}`);
    const now = new Date();
    const diff = pickupDateTime - now;

    if (diff <= 0) {
      setTimeUntilPickup('Collection time passed');
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      setTimeUntilPickup(`${days}d ${hours}h ${minutes}m`);
    } else {
      setTimeUntilPickup(`${hours}h ${minutes}m`);
    }
  };

  const handleCameraCapture = async (file) => {
    try {
      const formData = new FormData();
      formData.append('citizen_id', citizenData.id);
      formData.append('image_proof', file);
      formData.append('verification_status', 'pending');
      formData.append('ai_confidence_score', 95); // Simulating high AI score for demo
      formData.append('tokens_awarded', 50);

      await pb.collection('service_verifications').create(formData, { $autoCancel: false });
      
      // Reward Civic Score
      try {
        const { newScore, newTier, pointsChanged } = await updateCivicScore(pb, currentUser.id, 'Accurate_Segregation');
        setCivicScoreData({ current_score: newScore, tier_rank: newTier });
        toast.success(`Waste verified! +${pointsChanged} Civic Points & 50 Green Tokens.`);
      } catch (scoreErr) {
        toast.success('Verification submitted. Pending review.');
      }

      setShowCamera(false);
    } catch (error) {
      console.error('Error uploading verification:', error);
      toast.error('Failed to submit verification');
    }
  };

  const handleRewardRedeem = async (reward, finalCost) => {
    if (citizenData.green_tokens < finalCost) {
      toast.error('Insufficient tokens');
      return;
    }

    try {
      await pb.collection('redemptions').create({
        citizen_id: citizenData.id,
        reward_id: reward.id,
        tokens_spent: finalCost,
        redemption_date: new Date().toISOString(),
        status: 'pending'
      }, { $autoCancel: false });

      const newBalance = citizenData.green_tokens - finalCost;
      await pb.collection('citizens').update(citizenData.id, {
        green_tokens: newBalance
      }, { $autoCancel: false });

      setCitizenData({ ...citizenData, green_tokens: newBalance });
      toast.success('Reward redeemed successfully');
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background-dark py-12 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Citizen Dashboard - CleanConnect</title>
        <meta name="description" content="Manage your waste collection schedule and earn green tokens" />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background-dark py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>
              Welcome back, {currentUser?.name}
            </h1>
            <p className="text-muted-foreground">Manage your waste collection and climb the civic leaderboard</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Civic Score Widget */}
            <div className="lg:col-span-1">
              <CivicScoreArc score={civicScoreData.current_score} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              {citizenData?.next_pickup_date && (
                <div className="bg-gradient-to-r from-accent-green/10 to-civic-guardian/10 border border-accent-green/20 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <Sparkles className="w-48 h-48" />
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent-green rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-background-dark" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Next Pickup</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(citizenData.next_pickup_date).toLocaleDateString()} at {citizenData.next_pickup_time}
                        </p>
                        <p className="text-xs font-medium text-civic-guardian mt-1">Verified pickups earn +15 Civic Points</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent-green" />
                      <span className="text-2xl font-bold text-accent-green">{timeUntilPickup}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background-darker rounded-2xl p-6 border border-border flex flex-col items-center justify-center text-center">
                  <div className="flex items-center justify-between w-full mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Green Tokens</h3>
                    <Coins className="w-6 h-6 text-accent-green" />
                  </div>
                  <div className="text-6xl font-bold text-accent-green mb-2 tracking-tighter">
                    {citizenData?.green_tokens || 0}
                  </div>
                  <p className="text-muted-foreground text-sm">Available balance</p>
                </div>

                <div className="bg-background-darker rounded-2xl p-6 border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowCamera(true)}
                      className="w-full bg-accent-green text-background-dark hover:bg-accent-green-dark justify-start transition-transform active:scale-[0.98]"
                    >
                      <Camera className="w-5 h-5 mr-3" />
                      Verify Waste Segregation
                    </Button>
                    <Button
                      onClick={() => setShowComplaint(true)}
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-muted justify-start transition-transform active:scale-[0.98]"
                    >
                      <MessageSquare className="w-5 h-5 mr-3" />
                      Submit Complaint
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Rewards Store
                </h2>
                {civicScoreData.tier_rank !== 'Eco-Novice' && (
                  <p className="text-sm text-civic-guardian font-medium">
                    You are a {civicScoreData.tier_rank}! Enjoy exclusive discounts on all rewards.
                  </p>
                )}
              </div>
            </div>

            {rewards.length === 0 ? (
              <div className="bg-background-darker rounded-2xl p-12 text-center border border-border">
                <Coins className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-foreground font-medium mb-2">No rewards available</p>
                <p className="text-sm text-muted-foreground">Check back later for new rewards</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <RewardsCard
                    key={reward.id}
                    reward={reward}
                    userTokens={citizenData?.green_tokens || 0}
                    tier={civicScoreData.tier_rank}
                    onRedeem={handleRewardRedeem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCamera && (
        <CameraModule
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {showComplaint && (
        <ComplaintModal
          onClose={() => setShowComplaint(false)}
          citizenId={currentUser?.id}
          zoneId={citizenData?.zone_id}
        />
      )}
    </>
  );
};

export default CitizenDashboard;
