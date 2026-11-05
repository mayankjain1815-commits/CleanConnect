
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import Header from '@/components/Header.jsx';
import MapComponent from '@/components/MapComponent.jsx';
import QRScannerOverlay from '@/components/QRScannerOverlay.jsx';
import PerformanceTracker from '@/components/PerformanceTracker.jsx';
import { ScanLine, MapPin, Navigation, History, Target } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { getGPSLocation } from '@/lib/gpsUtils.js';

const DriverDashboard = () => {
  const { currentUser } = useAuth();
  const [driverData, setDriverData] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [bins, setBins] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [gpsData, setGpsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(updateGps, 15000); // Check GPS every 15s in background
    updateGps();
    return () => clearInterval(interval);
  }, [currentUser]);

  const updateGps = async () => {
    try {
      const loc = await getGPSLocation();
      setGpsData(loc);
    } catch (e) {
      console.warn("Background GPS check failed:", e);
    }
  };

  const fetchData = async () => {
    try {
      const drivers = await pb.collection('drivers').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        $autoCancel: false
      });

      if (drivers.length > 0) {
        setDriverData(drivers[0]);

        // Get Routes
        const routesList = await pb.collection('routes').getFullList({
          filter: `driver_id = "${drivers[0].user_id}"`,
          sort: '-created',
          $autoCancel: false
        });
        setRoutes(routesList);

        if (routesList.length > 0) {
          const zoneIds = [...new Set(routesList.map(r => r.zone_id))];
          const binsList = await pb.collection('bins').getFullList({
            filter: zoneIds.map(id => `zone_id = "${id}"`).join(' || '),
            $autoCancel: false
          });
          setBins(binsList);
        }

        // Get Scans for Today
        const today = new Date().toISOString().split('T')[0];
        const scans = await pb.collection('driver_qr_scans').getFullList({
          filter: `driver_id = "${currentUser.id}" && scanned_at >= "${today}"`,
          sort: '-scanned_at',
          expand: 'citizen_id.user_id',
          $autoCancel: false
        });
        setRecentScans(scans);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleScanComplete = () => {
    fetchData();
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background-dark py-12 px-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </>
    );
  }

  const getStatusBadge = (status) => {
    const variants = {
      'success': 'bg-qr-success/10 text-qr-success border-qr-success/20',
      'location_mismatch': 'bg-qr-warning/10 text-qr-warning border-qr-warning/20',
      'invalid_token': 'bg-qr-error/10 text-qr-error border-qr-error/20'
    };
    return variants[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <>
      <Helmet>
        <title>Driver Dashboard - CleanConnect</title>
        <meta name="description" content="Manage your collection routes and track performance" />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background-dark py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>
                Driver Operations
              </h1>
              <p className="text-muted-foreground">Truck: {driverData?.truck_number || 'Not assigned'}</p>
            </div>
            
            <div className="flex flex-col items-end text-sm">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">Scans Today: {recentScans.length} / {bins.length}</span>
              </div>
              {gpsData && (
                <div className={`flex items-center gap-1.5 ${gpsData.accuracy > 20 ? 'text-qr-warning' : 'text-qr-success'}`}>
                  <Navigation className="w-3.5 h-3.5" />
                  <span className="font-mono">Accuracy: ~{Math.round(gpsData.accuracy)}m</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-gradient-to-r from-qr-container to-background-darker border border-accent-green/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(232,210,181,0.10)] relative overflow-hidden group">
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
                  <ScanLine className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Ready to verify pickup?</h2>
                    <p className="text-muted-foreground text-sm max-w-sm">Scan the QR code printed on the citizen's bin to verify collection and log your progress.</p>
                  </div>
                  <Button
                    onClick={() => setShowScanner(true)}
                    className="w-full sm:w-auto bg-accent-green text-background-dark hover:bg-accent-green-dark py-6 px-8 text-lg rounded-xl shadow-lg transition-transform active:scale-[0.98]"
                  >
                    <ScanLine className="w-6 h-6 mr-3" />
                    Scan Bin QR
                  </Button>
                </div>
              </div>

              <div className="bg-background-darker border border-border rounded-2xl p-6 flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-4">Route Map</h3>
                <MapComponent bins={bins} />
              </div>
            </div>

            <div className="space-y-6">
              <PerformanceTracker
                strikes={driverData?.current_strikes || 0}
                baseDailyWage={driverData?.base_daily_wage || 500}
              />
              
              <div className="bg-background-darker border border-border rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <History className="w-5 h-5 mr-2 text-accent-green" />
                  Today's Scans
                </h3>
                
                {recentScans.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No bins scanned yet today.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {recentScans.map((scan) => (
                      <div key={scan.id} className="bg-background-dark rounded-xl p-3 border border-border flex justify-between items-center">
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="text-sm font-medium text-foreground truncate">
                            {scan.expand?.citizen_id?.expand?.user_id?.name || 'Citizen'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Badge variant="outline" className={`shrink-0 ${getStatusBadge(scan.scan_status)}`}>
                          {scan.scan_status === 'success' ? 'Verified' : 'Mismatch'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScanner && (
        <QRScannerOverlay
          driverId={currentUser?.id}
          onComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
};

export default DriverDashboard;
