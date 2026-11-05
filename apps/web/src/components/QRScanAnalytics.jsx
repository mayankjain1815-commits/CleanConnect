
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Skeleton } from '@/components/ui/skeleton.jsx';
import { ArrowUpDown, Activity, Crosshair, MapPin, UserX, ShieldCheck } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const QRScanAnalytics = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'scanned_at', direction: 'desc' });

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const records = await pb.collection('driver_qr_scans').getFullList({
        sort: '-scanned_at',
        expand: 'driver_id.user_id, citizen_id',
        $autoCancel: false
      });
      setScans(records);
    } catch (error) {
      console.error('Error fetching scans:', error);
      toast.error('Failed to load scan analytics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'success': 'bg-qr-success/10 text-qr-success border-qr-success/20',
      'location_mismatch': 'bg-qr-warning/10 text-qr-warning border-qr-warning/20',
      'invalid_token': 'bg-qr-error/10 text-qr-error border-qr-error/20'
    };
    return variants[status] || 'bg-muted text-muted-foreground';
  };

  // Compute statistics
  const todayScans = scans.filter(s => new Date(s.scanned_at).toDateString() === new Date().toDateString());
  const totalScans = scans.length;
  const successScans = scans.filter(s => s.scan_status === 'success');
  const successRate = totalScans > 0 ? Math.round((successScans.length / totalScans) * 100) : 0;
  const avgDistance = successScans.length > 0 
    ? Math.round(successScans.reduce((acc, curr) => acc + (curr.distance_meters || 0), 0) / successScans.length) 
    : 0;
  const failedCount = totalScans - successScans.length;

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredScans = scans.filter(s => statusFilter === 'all' || s.scan_status === statusFilter);
  const sortedScans = [...filteredScans].sort((a, b) => {
    if (sortConfig.key === 'scanned_at') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.scanned_at) - new Date(b.scanned_at)
        : new Date(b.scanned_at) - new Date(a.scanned_at);
    }
    if (sortConfig.key === 'distance_meters') {
      return sortConfig.direction === 'asc' 
        ? (a.distance_meters || 0) - (b.distance_meters || 0)
        : (b.distance_meters || 0) - (a.distance_meters || 0);
    }
    return 0;
  });

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background-darker rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Scans Today</h3>
            <Activity className="w-5 h-5 text-accent-green" />
          </div>
          <p className="text-3xl font-bold text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>{todayScans.length}</p>
        </div>
        
        <div className="bg-background-darker rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Success Rate</h3>
            <ShieldCheck className="w-5 h-5 text-qr-success" />
          </div>
          <p className="text-3xl font-bold text-qr-success" style={{ fontVariantNumeric: 'tabular-nums' }}>{successRate}%</p>
        </div>

        <div className="bg-background-darker rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Avg. Distance</h3>
            <Crosshair className="w-5 h-5 text-accent-green" />
          </div>
          <p className="text-3xl font-bold text-foreground font-mono">{avgDistance}m</p>
        </div>

        <div className="bg-background-darker rounded-2xl p-6 border border-border">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Failed Scans</h3>
            <UserX className="w-5 h-5 text-qr-error" />
          </div>
          <p className="text-3xl font-bold text-qr-error" style={{ fontVariantNumeric: 'tabular-nums' }}>{failedCount}</p>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="bg-background-darker rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground">Scan Activity Log</h2>
          <div className="w-full sm:w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background-dark border-border text-foreground">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="location_mismatch">Mismatch</SelectItem>
                <SelectItem value="invalid_token">Invalid Token</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium cursor-pointer group" onClick={() => handleSort('scanned_at')}>
                  <div className="flex items-center gap-1 hover:text-foreground">
                    Date/Time <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="px-6 py-4 font-medium">Driver</th>
                <th className="px-6 py-4 font-medium">Citizen ID</th>
                <th className="px-6 py-4 font-medium cursor-pointer group text-right" onClick={() => handleSort('distance_meters')}>
                  <div className="flex items-center justify-end gap-1 hover:text-foreground">
                    Distance <ArrowUpDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedScans.map((scan) => (
                <tr key={scan.id} className={`hover:bg-muted/10 transition-colors ${!scan.is_location_valid && scan.scan_status === 'location_mismatch' ? 'bg-qr-warning/5' : ''}`}>
                  <td className="px-6 py-4 text-foreground whitespace-nowrap">
                    {new Date(scan.scanned_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-foreground">
                    {scan.expand?.driver_id?.expand?.user_id?.name || scan.driver_id || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground truncate max-w-[150px]">
                    {scan.citizen_id}
                  </td>
                  <td className={`px-6 py-4 text-right font-mono ${scan.distance_meters > 30 ? 'text-qr-warning font-bold' : 'text-muted-foreground'}`}>
                    {scan.distance_meters ? `${Math.round(scan.distance_meters)}m` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant="outline" className={getStatusBadge(scan.scan_status)}>
                      {scan.scan_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
              {sortedScans.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                    No scan records found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QRScanAnalytics;
