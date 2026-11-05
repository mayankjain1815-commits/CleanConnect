
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { X, QrCode, ScanLine, AlertTriangle, CheckCircle, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import jsQR from 'jsqr';
import {
  getGPSLocation,
  calculateHaversineDistance,
  getEffectiveGeofenceRadius,
  GEOFENCE_RADIUS_METERS,
} from '@/lib/gpsUtils.js';
import { updateCivicScore } from '@/lib/civicScoreUtils.js';

const QRScannerOverlay = ({ onComplete, onClose, driverId }) => {
  const [mode, setMode] = useState('camera'); // 'camera' or 'manual'
  const [manualToken, setManualToken] = useState('');
  const [gpsData, setGpsData] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success'|'mismatch'|'invalid', data: any }
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize GPS on mount
  useEffect(() => {
    fetchLocation();
    return () => stopCamera();
  }, []);

  // Initialize Camera when mode changes
  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
  }, [mode]);

  const fetchLocation = async () => {
    try {
      setGpsLoading(true);
      const loc = await getGPSLocation();
      setGpsData(loc);
    } catch (error) {
      toast.error('Failed to get location: ' + error.message);
    } finally {
      setGpsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.warn("Camera unavailable, falling back to manual mode:", err);
      toast.error("Camera access denied or unavailable");
      setMode('manual');
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const tick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA || processing || result) {
      if (!result && mode === 'camera') animationFrameRef.current = requestAnimationFrame(tick);
      return;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code && code.data) {
      handleVerification(code.data);
    } else {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    handleVerification(manualToken.trim());
  };

  const handleVerification = async (scannedToken) => {
    setProcessing(true);
    stopCamera();

    try {
      // 1. Ensure GPS is available
      let loc = gpsData;
      if (!loc) {
        loc = await getGPSLocation();
        setGpsData(loc);
      }

      // 2. Find token in DB
      let binTokenRecord;
      try {
        const tokens = await pb.collection('bin_qr_tokens').getFullList({
          filter: `qr_token="${scannedToken}" && is_active=true`,
          expand: 'citizen_id',
          $autoCancel: false
        });
        if (tokens.length === 0) throw new Error("Token not found");
        binTokenRecord = tokens[0];
      } catch (e) {
        // Token invalid
        console.warn('[QR Scanner] Token lookup failed:', e?.message || e);
        await createScanRecord(null, loc, false, 0, 'invalid_token');
        setResult({ type: 'invalid', message: 'This QR code is not linked to an active bin. Ask the citizen to regenerate it from Profile → My Dustbin QR.' });
        autoDismiss(5000);
        return;
      }

      // 3. Check distance. The base geofence is 50m; we add the device's
      // reported GPS accuracy (capped) so an honest but imprecise reading
      // does not fail the scan.
      if (!Number.isFinite(binTokenRecord.geofence_lat) || !Number.isFinite(binTokenRecord.geofence_lng)) {
        setResult({
          type: 'invalid',
          message: 'This bin does not have a saved location yet. Ask the citizen to regenerate their QR code.'
        });
        autoDismiss(5000);
        return;
      }

      const accuracy = Number.isFinite(loc.accuracy) ? loc.accuracy : 0;
      const distance = calculateHaversineDistance(
        loc.latitude,
        loc.longitude,
        binTokenRecord.geofence_lat,
        binTokenRecord.geofence_lng
      );
      const allowedRadius = getEffectiveGeofenceRadius(GEOFENCE_RADIUS_METERS, accuracy);
      const valid = distance <= allowedRadius;

      console.info('[QR Scanner] Location check', {
        distance: `${distance}m`,
        gpsAccuracy: `${Math.round(accuracy)}m`,
        baseRadius: `${GEOFENCE_RADIUS_METERS}m`,
        allowedRadius: `${Math.round(allowedRadius)}m`,
        valid,
      });

      // 4. Create scan record
      await createScanRecord(binTokenRecord.citizen_id, loc, valid, distance, valid ? 'success' : 'location_mismatch');

      // 5. Provide Feedback & Rewards
      if (valid) {
        try {
          await updateCivicScore(pb, binTokenRecord.citizen_id, 'Daily_Pickup_Verified');
        } catch (e) {} // fail silently if not admin

        setResult({
          type: 'success',
          distance: distance,
          accuracy: Math.round(accuracy),
          citizen: binTokenRecord.expand?.citizen_id?.name || binTokenRecord.expand?.citizen_id?.expand?.user_id?.name || 'Citizen',
          address: binTokenRecord.house_address
        });
        setTimeout(() => {
          onComplete && onComplete();
          onClose();
        }, 3000);
      } else {
        setResult({
          type: 'mismatch',
          distance: distance,
          accuracy: Math.round(accuracy),
          required: Math.round(allowedRadius),
          baseRadius: GEOFENCE_RADIUS_METERS,
        });
        autoDismiss(5000);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during verification');
      resetScanner();
    } finally {
      setProcessing(false);
    }
  };

  const createScanRecord = async (citizenId, loc, isValid, distance, status) => {
    try {
      await pb.collection('driver_qr_scans').create({
        driver_id: driverId,
        citizen_id: citizenId || 'unknown',
        gps_lat_at_scan: loc.latitude,
        gps_lng_at_scan: loc.longitude,
        is_location_valid: isValid,
        distance_meters: distance,
        scan_status: status
      }, { $autoCancel: false });
    } catch (e) {
      console.error("Failed to log scan", e);
    }
  };

  const autoDismiss = (delay = 3000) => {
    setTimeout(() => {
      resetScanner();
    }, delay);
  };

  const resetScanner = () => {
    setResult(null);
    setManualToken('');
    if (mode === 'camera') startCamera();
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col z-50 overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-qr-container/80 backdrop-blur-md border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ScanLine className="w-5 h-5 text-accent-green" />
          Verify Bin Pickup
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground hover:text-qr-error">
          <X className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {processing && !result && (
          <div className="text-center animate-pulse">
            <Navigation className="w-16 h-16 text-accent-green mx-auto mb-4 animate-spin" />
            <p className="text-foreground font-medium text-lg">Validating GPS Coordinates...</p>
            <p className="text-muted-foreground text-sm">Please hold steady</p>
          </div>
        )}

        {result && (
          <div className="w-full max-w-sm">
            {result.type === 'success' && (
              <div className="bg-qr-success/10 border border-qr-success p-8 rounded-2xl text-center animate-checkmark">
                <CheckCircle className="w-20 h-20 text-qr-success mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-qr-success mb-2">Bin Verified</h3>
                <p className="text-foreground font-medium mb-1">{result.citizen}</p>
                <p className="text-muted-foreground text-sm mb-4">{result.address}</p>
                <Badge className="bg-accent-green text-background-dark text-lg px-4 py-1.5 mb-2">+15 Civic Points</Badge>
                <p className="font-mono text-xs text-muted-foreground mt-4">
                  Distance: {Math.round(result.distance)}m · GPS accuracy: ~{result.accuracy}m
                </p>
              </div>
            )}
            
            {result.type === 'mismatch' && (
              <div className="bg-qr-warning/10 border border-qr-warning p-8 rounded-2xl text-center animate-shake">
                <AlertTriangle className="w-20 h-20 text-qr-warning mx-auto mb-4" />
                <h3 className="text-xl font-bold text-qr-warning mb-2">Location Mismatch</h3>
                <p className="text-foreground text-sm mb-4">
                  Move closer to the house bin and try again. You must be within {result.required}m
                  {result.accuracy > 0 ? ` (${result.baseRadius}m + ${result.accuracy}m GPS tolerance)` : ''}.
                </p>
                <div className="bg-background-darker p-3 rounded-lg flex justify-between text-sm font-mono mb-2">
                  <span className="text-qr-warning font-bold">Your distance: {Math.round(result.distance)}m</span>
                  <span className="text-muted-foreground">Allowed: {result.required}m</span>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  GPS accuracy: ~{result.accuracy}m. If this looks wrong, wait a few seconds for a better signal and retry,
                  or use manual entry.
                </p>
                <Button onClick={resetScanner} className="w-full bg-qr-warning text-qr-warning-foreground hover:brightness-110">
                  Try Again
                </Button>
              </div>
            )}

            {result.type === 'invalid' && (
              <div className="bg-qr-error/10 border border-qr-error p-8 rounded-2xl text-center animate-shake">
                <X className="w-20 h-20 text-qr-error mx-auto mb-4" />
                <h3 className="text-xl font-bold text-qr-error mb-2">Invalid Token</h3>
                <p className="text-foreground text-sm mb-6">{result.message}</p>
                <Button onClick={resetScanner} className="w-full bg-qr-error text-qr-error-foreground hover:brightness-110">
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        {!processing && !result && (
          <div className="w-full max-w-md flex flex-col items-center">
            {mode === 'camera' ? (
              <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden bg-background-darker border-2 border-accent-green/50 shadow-[0_0_30px_rgba(232,210,181,0.18)]">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-2 border-accent-green m-12 rounded-lg opacity-50 shadow-[inset_0_0_20px_rgba(232,210,181,0.45)]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-accent-green/20 to-transparent h-1 animate-pulse top-1/2"></div>
              </div>
            ) : (
              <div className="w-full bg-qr-container rounded-2xl p-6 border border-border">
                <div className="text-center mb-6">
                  <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">Enter the code displayed on the bin</p>
                </div>
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="token" className="text-foreground">Token Code</Label>
                    <Input
                      id="token"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="e.g. A1B2C3D4..."
                      className="bg-background-dark border-border font-mono text-center text-lg tracking-widest mt-2"
                      autoComplete="off"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-accent-green text-background-dark hover:bg-accent-green-dark">
                    Verify Manual Entry
                  </Button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4 bg-qr-container border-t border-border flex flex-col gap-4">
        <div className="flex items-center justify-between text-xs px-2">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${gpsLoading ? 'text-muted-foreground animate-pulse' : gpsData?.accuracy <= 20 ? 'text-qr-success' : 'text-qr-warning'}`} />
            <span className="text-muted-foreground">
              {gpsLoading ? 'Acquiring GPS...' : `Accuracy: ~${Math.round(gpsData?.accuracy)}m`}
            </span>
          </div>
          {!gpsLoading && gpsData?.accuracy > 20 && (
            <span className="text-qr-warning font-medium">Poor signal</span>
          )}
        </div>

        {!processing && !result && (
          <Button 
            variant="outline" 
            onClick={() => setMode(mode === 'camera' ? 'manual' : 'camera')}
            className="w-full border-border text-foreground hover:bg-muted"
          >
            {mode === 'camera' ? 'Switch to Manual Entry' : 'Switch to Camera Scan'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRScannerOverlay;
