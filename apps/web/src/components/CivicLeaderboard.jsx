
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { calculateTier } from '@/lib/civicScoreUtils';

const CivicLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      // In a real app we'd aggregate this on the backend or via a view.
      // Here we fetch citizens and their civic_scores to group by neighborhood.
      const [citizens, scores] = await Promise.all([
        pb.collection('citizens').getFullList({ expand: 'user_id', $autoCancel: false }),
        pb.collection('civic_scores').getFullList({ $autoCancel: false }),
      ]);

      const scoreMap = {};
      scores.forEach(s => {
        scoreMap[s.citizen_id] = s.current_score;
      });

      const neighborhoodMap = {};
      citizens.forEach(cit => {
        const nName = cit.neighborhood || cit.zone_id || 'Unknown Area';
        if (!neighborhoodMap[nName]) {
          neighborhoodMap[nName] = { name: nName, totalScore: 0, count: 0, citizens: [] };
        }
        const userScore = scoreMap[cit.user_id] || 300;
        neighborhoodMap[nName].totalScore += userScore;
        neighborhoodMap[nName].count += 1;
        neighborhoodMap[nName].citizens.push({
          id: cit.id,
          name: cit.expand?.user_id?.name || 'Unknown',
          score: userScore,
          tier: calculateTier(userScore),
        });
      });

      const processed = Object.values(neighborhoodMap).map(n => ({
        ...n,
        avgScore: Math.round(n.totalScore / n.count),
        // Mock trend for visual purposes (in reality calculated against historical data)
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      })).sort((a, b) => b.avgScore - a.avgScore).slice(0, 10);

      setLeaderboard(processed);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 751) return 'bg-civic-guardian/20 text-civic-guardian';
    if (score >= 551) return 'bg-civic-champion/20 text-civic-champion';
    return 'bg-destructive/20 text-destructive';
  };

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-muted-foreground">Loading leaderboard...</div>;
  }

  return (
    <div className="bg-background-darker rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Neighborhood Leaderboard</h2>
        <span className="text-sm text-muted-foreground">Top 10 Areas</span>
      </div>

      <div className="overflow-hidden">
        <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border text-sm font-medium text-muted-foreground">
          <div className="col-span-5">Neighborhood</div>
          <div className="col-span-3 text-center">Avg Score</div>
          <div className="col-span-2 text-center">Citizens</div>
          <div className="col-span-2 text-right">Trend</div>
        </div>

        <div className="divide-y divide-border">
          {leaderboard.map((area, idx) => (
            <div key={area.name} className="py-2">
              <div 
                className="grid grid-cols-12 gap-4 py-3 items-center cursor-pointer hover:bg-muted/50 rounded-lg transition-colors px-2"
                onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
              >
                <div className="col-span-5 flex items-center gap-3">
                  <span className="text-muted-foreground w-4 text-right">{idx + 1}.</span>
                  <span className="font-medium text-foreground truncate">{area.name}</span>
                </div>
                <div className="col-span-3 flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreColor(area.avgScore)}`}>
                    {area.avgScore}
                  </span>
                </div>
                <div className="col-span-2 text-center text-muted-foreground">{area.count}</div>
                <div className="col-span-2 flex justify-end items-center gap-2">
                  {area.trend === 'up' && <TrendingUp className="w-4 h-4 text-civic-guardian" />}
                  {area.trend === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
                  {area.trend === 'stable' && <Minus className="w-4 h-4 text-muted-foreground" />}
                  {expandedRow === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              <AnimatePresence>
                {expandedRow === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-10 py-3 bg-background-dark/50 rounded-xl mt-2 mb-2 space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Citizens</h4>
                      {area.citizens.sort((a,b) => b.score - a.score).slice(0, 3).map((cit, cIdx) => (
                        <div key={cit.id} className="flex justify-between items-center text-sm">
                          <span className="text-foreground">{cIdx + 1}. {cit.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">{cit.tier}</span>
                            <span className="font-semibold text-accent-foreground">{cit.score} pts</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CivicLeaderboard;
