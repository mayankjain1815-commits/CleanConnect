
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { TrendingDown, TrendingUp } from 'lucide-react';

const PerformanceTracker = ({ strikes = 0, baseDailyWage = 500 }) => {
  const maxStrikes = 5;
  const deductionPercentage = strikes * 15;
  const deductionAmount = (baseDailyWage * deductionPercentage) / 100;
  const finalWage = baseDailyWage - deductionAmount;
  const strikePercentage = (strikes / maxStrikes) * 100;

  return (
    <div className="bg-background-dark rounded-2xl p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">Performance Tracker</h3>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Current Strikes</span>
            <span className="text-2xl font-bold text-warning-orange">{strikes}/{maxStrikes}</span>
          </div>
          <Progress value={strikePercentage} className="h-2" />
          {strikes > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <TrendingDown className="w-4 h-4 text-warning-orange" />
              <span className="text-xs text-muted-foreground">
                {deductionPercentage}% wage deduction applied
              </span>
            </div>
          )}
        </div>

        <div className="bg-muted rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Base Daily Wage</span>
            <span className="text-sm font-medium text-foreground">₹{baseDailyWage}</span>
          </div>
          
          {strikes > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Deduction ({deductionPercentage}%)</span>
              <span className="text-sm font-medium text-warning-orange">-₹{deductionAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Final Wage</span>
            <div className="flex items-center gap-2">
              {strikes === 0 ? (
                <TrendingUp className="w-4 h-4 text-success-green" />
              ) : (
                <TrendingDown className="w-4 h-4 text-warning-orange" />
              )}
              <span className="text-lg font-bold text-accent-green">₹{finalWage.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {strikes >= 3 && (
          <div className="bg-warning-orange/10 border border-warning-orange/20 rounded-lg p-3">
            <p className="text-xs text-warning-orange">
              Warning: High strike count. Complete routes on time to avoid further deductions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceTracker;
