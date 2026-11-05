
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import MapComponent from '@/components/MapComponent';
import CivicLeaderboard from '@/components/CivicLeaderboard';
import QRScanAnalytics from '@/components/QRScanAnalytics';
import { TrendingDown, DollarSign, Trash2, ArrowUpDown, BarChart3, ScanLine, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
import { calculateTier } from '@/lib/civicScoreUtils';

const AdminPanel = () => {
  const [bins, setBins] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [payrollAdjustments, setPayrollAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scoreSort, setScoreSort] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [binsList, driversList, citizensList, scoresList, payrollList, ledgersList] = await Promise.all([
        pb.collection('bins').getFullList({ $autoCancel: false }),
        pb.collection('drivers').getFullList({ expand: 'user_id', $autoCancel: false }),
        pb.collection('citizens').getFullList({ expand: 'user_id', $autoCancel: false }),
        pb.collection('civic_scores').getFullList({ $autoCancel: false }),
        pb.collection('payroll_adjustments').getFullList({ sort: '-created', $autoCancel: false }),
        pb.collection('civic_score_ledger').getFullList({ sort: '-created', $autoCancel: false })
      ]);

      setBins(binsList);
      setDrivers(driversList);
      setPayrollAdjustments(payrollList);

      const mergedCitizens = citizensList.map(cit => {
        const scoreDoc = scoresList.find(s => s.citizen_id === cit.user_id);
        const latestLedger = ledgersList.find(l => l.citizen_id === cit.user_id);
        return {
          ...cit,
          civic_score: scoreDoc?.current_score || 300,
          tier: calculateTier(scoreDoc?.current_score || 300),
          lastReason: latestLedger ? latestLedger.reason.replace(/_/g, ' ') : 'No recent activity',
          lastDate: latestLedger ? new Date(latestLedger.timestamp).toLocaleDateString() : 'N/A'
        };
      });
      setCitizens(mergedCitizens);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load admin panel data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateTotalSavings = () => {
    return payrollAdjustments.reduce((sum, adj) => sum + (adj.deduction_amount || 0), 0);
  };

  const getStatusBadge = (status) => {
    const variants = {
      STABLE: 'bg-success-green/10 text-success-green border-success-green/20',
      CRITICAL: 'bg-destructive/10 text-destructive border-destructive/20',
      OVERFLOWING: 'bg-warning-orange/10 text-warning-orange border-warning-orange/20'
    };
    return variants[status] || variants.STABLE;
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 751) return 'bg-civic-guardian/10 text-civic-guardian border-civic-guardian/20';
    if (score >= 551) return 'bg-civic-champion/10 text-civic-champion border-civic-champion/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  const handleSortScores = () => {
    const newSort = scoreSort === 'desc' ? 'asc' : 'desc';
    setScoreSort(newSort);
    const sorted = [...citizens].sort((a, b) => {
      return newSort === 'desc' ? b.civic_score - a.civic_score : a.civic_score - b.civic_score;
    });
    setCitizens(sorted);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background-dark py-12 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - CleanConnect</title>
        <meta name="description" content="Manage city-wide waste collection operations and analytics" />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background-dark py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>
                Admin Control Panel
              </h1>
              <p className="text-muted-foreground">City-wide waste management analytics and operations</p>
            </div>
            <Button onClick={fetchData} disabled={refreshing} variant="outline" className="border-border text-foreground hover:bg-muted">
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-background-darker border border-border p-1 mb-8 h-auto flex-wrap">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background-dark rounded-lg py-2 px-4">
                <BarChart3 className="w-4 h-4 mr-2" /> Operations Overview
              </TabsTrigger>
              <TabsTrigger value="qr-analytics" className="data-[state=active]:bg-background-dark rounded-lg py-2 px-4">
                <ScanLine className="w-4 h-4 mr-2" /> QR Scan Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8 mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background-darker rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Bins</h3>
                    <Trash2 className="w-5 h-5 text-accent-green" />
                  </div>
                  <p className="text-3xl font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{bins.length}</p>
                </div>

                <div className="bg-background-darker rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Active Drivers</h3>
                    <TrendingDown className="w-5 h-5 text-accent-green" />
                  </div>
                  <p className="text-3xl font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{drivers.length}</p>
                </div>

                <div className="bg-background-darker rounded-2xl p-6 border border-border shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Fund Savings</h3>
                    <DollarSign className="w-5 h-5 text-success-green" />
                  </div>
                  <p className="text-3xl font-bold text-success-green" style={{ fontVariantNumeric: 'tabular-nums' }}>₹{calculateTotalSavings().toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">From automated deductions</p>
                </div>
              </div>

              <div>
                <CivicLeaderboard />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6" style={{ letterSpacing: '-0.02em' }}>
                  Ghost-Scheduled Areas Heatmap
                </h2>
                <MapComponent bins={bins} showHeatmap={true} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-background-darker rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Smart Bin Analytics</h2>
                  {bins.length === 0 ? (
                    <div className="text-center py-12">
                      <Trash2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-2">No bins registered</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {bins.map((bin) => (
                        <div key={bin.id} className="bg-background-dark rounded-xl p-4 border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-foreground">{bin.street_location || 'Unknown Location'}</p>
                            <Badge variant="outline" className={getStatusBadge(bin.status)}>
                              {bin.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Fill Level: {bin.fill_level}%</span>
                            <span>Last Cleared: {bin.last_cleared ? new Date(bin.last_cleared).toLocaleDateString() : 'Never'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-background-darker rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Driver Performance</h2>
                  {drivers.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingDown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-2">No drivers registered</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {drivers.map((driver) => {
                        const deductionPercentage = (driver.current_strikes || 0) * 15;
                        const deductionAmount = ((driver.base_daily_wage || 0) * deductionPercentage) / 100;
                        const finalWage = (driver.base_daily_wage || 0) - deductionAmount;

                        return (
                          <div key={driver.id} className="bg-background-dark rounded-xl p-4 border border-border">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-foreground">
                                {driver.expand?.user_id?.name || 'Driver'} (Truck: {driver.truck_number})
                              </p>
                              <span className="text-xs text-muted-foreground font-semibold">Strikes: {driver.current_strikes || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Base: ₹{driver.base_daily_wage || 0}</span>
                              {deductionAmount > 0 && (
                                <span className="text-warning-orange">-₹{deductionAmount.toFixed(2)}</span>
                              )}
                              <span className="text-accent-green font-medium">Final: ₹{finalWage.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qr-analytics" className="mt-0">
              <QRScanAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default AdminPanel;
