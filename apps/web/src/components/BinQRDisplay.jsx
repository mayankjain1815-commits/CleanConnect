
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { Download, Printer, RefreshCw, MapPin, ShieldCheck, History } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { generateBinQRToken, validateQRToken, formatTokenDisplay } from '@/lib/qrTokenUtils.js';
import { getGPSLocation } from '@/lib/gpsUtils.js';

const BinQRDisplay = ({ citizenId, userData }) => {
  const [qrData, setQrData] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (citizenId) {
      fetchQRData();
    }
  }, [citizenId]);

  const fetchQRData = async () => {
    try {
      // Fetch active QR token for this citizen
      const tokens = await pb.collection('bin_qr_tokens').getFullList({
        filter: `citizen_id = "${citizenId}" && is_active = true`,
        sort: '-created',
        $autoCancel: false
      });

      if (tokens.length > 0) {
        setQrData(tokens[0]);
        
        // Fetch recent scans for this token/citizen
        const scans = await pb.collection('driver_qr_scans').getFullList({
          filter: `citizen_id = "${citizenId}"`,
          sort: '-scanned_at',
          expand: 'driver_id.user_id',
          limit: 5,
          $autoCancel: false
        });
        setScanHistory(scans);
      }
    } catch (error) {
      console.error('Error fetching QR data:', error);
      toast.error('Failed to load QR data');
    } finally {
      setLoading(false);
    }
  };

  const getHouseAddress = async () => {
    if (qrData?.house_address && qrData.house_address !== 'Update Address') {
      return qrData.house_address;
    }

    try {
      const citizens = await pb.collection('citizens').getFullList({
        filter: `user_id = "${citizenId}"`,
        $autoCancel: false
      });
      const citizen = citizens[0];
      const zone = citizen?.zone_id || userData?.zone_id;
      const parts = [
        citizen?.neighborhood,
        zone ? `Zone ${zone}` : null
      ].filter(Boolean);

      if (parts.length > 0) return parts.join(', ');
    } catch (error) {
      console.warn('Could not load citizen address for QR code:', error);
    }

    return 'Household bin';
  };

  const handleRegenerate = async () => {
    const message = qrData
      ? 'Are you sure? This will invalidate your previous QR code and require you to print a new one.'
      : 'Generate a QR code for this household? Stand next to your bin so we can save its location.';

    if (!window.confirm(message)) {
      return;
    }

    setRegenerating(true);
    try {
      // Prefer a fresh GPS reading. Fall back to the existing coordinates
      // when regenerating an already-located bin.
      let latitude = qrData?.geofence_lat;
      let longitude = qrData?.geofence_lng;

      try {
        const loc = await getGPSLocation();
        latitude = loc.latitude;
        longitude = loc.longitude;
      } catch (gpsError) {
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          toast.error('Location is required. Turn on location access, stand next to your bin, and try again.');
          return;
        }
        toast.warning('Could not get a fresh GPS reading — keeping the previous bin location.');
      }

      // Invalidate old tokens
      const oldTokens = await pb.collection('bin_qr_tokens').getFullList({
        filter: `citizen_id = "${citizenId}" && is_active = true`,
        $autoCancel: false
      });

      for (const token of oldTokens) {
        await pb.collection('bin_qr_tokens').update(token.id, { is_active: false }, { $autoCancel: false });
      }

      // Generate new token
      const houseAddress = await getHouseAddress();
      const newTokenHex = await generateBinQRToken(citizenId, houseAddress);

      if (!validateQRToken(newTokenHex)) {
        throw new Error('Generated token failed validation');
      }

      const newToken = await pb.collection('bin_qr_tokens').create({
        citizen_id: citizenId,
        qr_token: newTokenHex,
        house_address: houseAddress,
        geofence_lat: latitude,
        geofence_lng: longitude,
        is_active: true
      }, { $autoCancel: false });

      setQrData(newToken);
      toast.success('New QR code generated successfully');
    } catch (error) {
      console.error('Error regenerating token:', error);
      toast.error('Failed to regenerate QR code');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('bin-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `CleanConnect-QR-${formatTokenDisplay(qrData?.qr_token)}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-2xl" />;
  }

  if (!qrData) {
    return (
      <div className="bg-qr-container rounded-2xl p-8 border border-border text-center">
        <ShieldCheck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">No Active QR Code</h3>
        <p className="text-muted-foreground mb-6">You don't have an active QR code assigned to your bin yet.</p>
        <Button onClick={handleRegenerate} disabled={regenerating} className="bg-accent-green text-background-dark hover:bg-accent-green-dark">
          {regenerating ? 'Generating...' : 'Generate New QR Code'}
        </Button>
      </div>
    );
  }

  const lastScan = scanHistory[0];

  return (
    <div className="space-y-6">
      <div className="bg-qr-container rounded-2xl p-8 border-2 border-accent-green/30 shadow-[0_0_30px_rgba(232,210,181,0.18)] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="bg-white p-4 rounded-xl shadow-lg shrink-0 print:border-none print:shadow-none">
          <QRCodeSVG 
            id="bin-qr-code"
            value={qrData.qr_token} 
            size={200} 
            level="H"
            includeMargin={false}
          />
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div>
            <Badge variant="outline" className="bg-accent-green/10 text-accent-green border-accent-green/20 font-bold tracking-widest uppercase mb-2">
              SCAN ME FOR PICKUP
            </Badge>
            <h2 className="text-2xl font-bold text-foreground">{userData?.name || 'Citizen'}</h2>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="w-4 h-4 mr-1 shrink-0" />
              <span className="truncate">{qrData.house_address}</span>
            </div>
            <p className="font-mono text-sm bg-background-dark px-3 py-1.5 rounded-md text-muted-foreground inline-block mt-3 border border-border">
              TOKEN: {formatTokenDisplay(qrData.qr_token)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
            <Button onClick={handleDownload} variant="outline" className="border-border text-foreground hover:bg-muted">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Button onClick={handlePrint} variant="outline" className="border-border text-foreground hover:bg-muted">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button onClick={handleRegenerate} disabled={regenerating} variant="ghost" className="text-muted-foreground hover:text-warning-orange">
              <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} /> 
              Regenerate
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-background-darker rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <History className="w-5 h-5 mr-2 text-accent-green" />
            Recent Scans
          </h3>
          {lastScan && (
            <span className="text-xs text-muted-foreground">
              Last scanned: {new Date(lastScan.scanned_at).toLocaleString()}
            </span>
          )}
        </div>

        {scanHistory.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No scans recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-muted-foreground border-b border-border">
                <tr>
                  <th className="pb-3 font-medium">Date & Time</th>
                  <th className="pb-3 font-medium">Driver Name</th>
                  <th className="pb-3 font-medium text-center">Distance</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scanHistory.map(scan => (
                  <tr key={scan.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 text-foreground">{new Date(scan.scanned_at).toLocaleString()}</td>
                    <td className="py-3 text-foreground">{scan.expand?.driver_id?.expand?.user_id?.name || 'Unknown Driver'}</td>
                    <td className="py-3 text-center font-mono text-muted-foreground">{Math.round(scan.distance_meters)}m</td>
                    <td className="py-3 text-right">
                      <Badge variant="outline" className={
                        scan.scan_status === 'success' ? 'bg-qr-success/10 text-qr-success border-qr-success/20' :
                        scan.scan_status === 'location_mismatch' ? 'bg-qr-warning/10 text-qr-warning border-qr-warning/20' :
                        'bg-qr-error/10 text-qr-error border-qr-error/20'
                      }>
                        {scan.scan_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BinQRDisplay;
