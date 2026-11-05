
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Shield, Leaf } from 'lucide-react';
import { calculateTier } from '@/lib/civicScoreUtils';

const CivicScoreArc = ({ score = 300 }) => {
  const [animatedScore, setAnimatedScore] = useState(300);
  const minScore = 300;
  const maxScore = 900;
  
  useEffect(() => {
    // Smooth counter animation could be done with Framer Motion useSpring,
    // but for simplicity we'll just set it to trigger the stroke dash offset
    setAnimatedScore(score);
  }, [score]);

  const tier = calculateTier(animatedScore);
  const normalizedScore = Math.max(0, Math.min(1, (animatedScore - minScore) / (maxScore - minScore)));
  
  // SVG Arc calculation
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - normalizedScore * circumference;

  const getTierDetails = (t) => {
    switch (t) {
      case 'Elite Guardian':
        return {
          color: 'text-civic-guardian',
          bg: 'bg-civic-guardian/10',
          icon: <Shield className="w-5 h-5 text-civic-guardian" />,
          nextTier: 'Max Tier Achieved!',
        };
      case 'Civic Champion':
        return {
          color: 'text-civic-champion',
          bg: 'bg-civic-champion/10',
          icon: <Award className="w-5 h-5 text-civic-champion" />,
          nextTier: `Next tier at 751 points (${751 - animatedScore} to go)`,
        };
      default:
        return {
          color: 'text-civic-novice',
          bg: 'bg-civic-novice/10',
          icon: <Leaf className="w-5 h-5 text-civic-novice" />,
          nextTier: `Next tier at 551 points (${551 - animatedScore} to go)`,
        };
    }
  };

  const details = getTierDetails(tier);

  return (
    <div className="bg-background-darker rounded-2xl p-6 border border-border flex flex-col items-center justify-center relative overflow-hidden group">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground">Civic Score</h3>
        <p className="text-sm text-muted-foreground">{details.nextTier}</p>
      </div>

      <div className="relative w-48 h-28 flex items-end justify-center">
        {/* Background Arc */}
        <svg className="absolute top-0 left-0 w-full h-full overflow-visible" viewBox="0 0 200 100">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--destructive))" />
              <stop offset="50%" stopColor="hsl(var(--civic-champion))" />
              <stop offset="100%" stopColor="hsl(var(--civic-guardian))" />
            </linearGradient>
          </defs>
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            strokeLinecap="round"
            className="text-muted/30"
          />
          {/* Animated Arc */}
          <motion.path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        <div className="text-center pb-2">
          <div className="text-4xl font-bold text-foreground">
            {animatedScore} <span className="text-lg text-muted-foreground font-normal">/ 900</span>
          </div>
        </div>
      </div>

      <div className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-full ${details.bg} ${details.color} transition-colors duration-300`}>
        {details.icon}
        <span className="font-semibold">{tier}</span>
      </div>
    </div>
  );
};

export default CivicScoreArc;
