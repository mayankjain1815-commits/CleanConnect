
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { History, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';

const CivicScoreLedger = () => {
  const { currentUser } = useAuth();
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterReason, setFilterReason] = useState('all');

  useEffect(() => {
    fetchLedger();
  }, [currentUser, filterReason]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      let filterStr = `citizen_id = "${currentUser.id}"`;
      if (filterReason !== 'all') {
        filterStr += ` && reason = "${filterReason}"`;
      }

      // Fetch last 30 days of activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filterStr += ` && timestamp >= "${thirtyDaysAgo.toISOString().split('T')[0]}"`;

      const records = await pb.collection('civic_score_ledger').getFullList({
        filter: filterStr,
        sort: '-timestamp',
        $autoCancel: false,
      });
      setLedger(records);
    } catch (error) {
      console.error('Error fetching ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPointsColor = (points) => {
    if (points > 0) return 'text-civic-guardian';
    if (points < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <>
      <Helmet>
        <title>Civic Score Ledger - CleanConnect</title>
        <meta name="description" content="View your Civic Score history and ledger" />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-background-dark py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link to="/profile" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>

          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>
                Civic Score Ledger
              </h1>
              <p className="text-muted-foreground">Immutable history of your civic contributions (Last 30 Days)</p>
            </div>

            <div className="w-full md:w-64">
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger className="bg-background-darker border-border text-foreground">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="Accurate_Segregation">Accurate Segregation</SelectItem>
                  <SelectItem value="Daily_Pickup_Verified">Daily Pickup Verified</SelectItem>
                  <SelectItem value="Streak_Bonus">Streak Bonus</SelectItem>
                  <SelectItem value="False_Complaint">False Complaint Penalty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-background-darker rounded-2xl border border-border overflow-hidden shadow-lg">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : ledger.length === 0 ? (
              <div className="p-16 text-center">
                <History className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No history found</h3>
                <p className="text-sm text-muted-foreground">We couldn't find any ledger entries for the selected filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/30 border-b border-border text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-medium">Date & Time</th>
                      <th className="px-6 py-4 font-medium">Action Reason</th>
                      <th className="px-6 py-4 font-medium text-right">Points Change</th>
                      <th className="px-6 py-4 font-medium text-right">New Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ledger.map((entry) => (
                      <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 text-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            {entry.reason.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${getPointsColor(entry.points_changed)}`}>
                          {entry.points_changed > 0 ? '+' : ''}{entry.points_changed}
                        </td>
                        <td className="px-6 py-4 text-right text-foreground font-semibold">
                          {entry.new_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CivicScoreLedger;
