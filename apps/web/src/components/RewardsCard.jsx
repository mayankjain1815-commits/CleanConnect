
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Zap, ShoppingBag, Tag } from 'lucide-react';

const RewardsCard = ({ reward, userTokens, onRedeem, tier = 'Eco-Novice' }) => {
  const getDiscount = (currentTier) => {
    if (currentTier === 'Elite Guardian') return 0.25;
    if (currentTier === 'Civic Champion') return 0.10;
    return 0;
  };

  const discount = getDiscount(tier);
  const discountedCost = Math.round(reward.token_cost * (1 - discount));
  const canAfford = userTokens >= discountedCost;
  
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'electricity':
        return <Zap className="w-5 h-5" />;
      case 'grocery':
        return <ShoppingBag className="w-5 h-5" />;
      default:
        return <Coins className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'electricity':
        return 'bg-civic-champion/10 text-civic-champion border-civic-champion/20';
      case 'grocery':
        return 'bg-civic-guardian/10 text-civic-guardian border-civic-guardian/20';
      default:
        return 'bg-accent-green/10 text-accent-green border-accent-green/20';
    }
  };

  return (
    <div className="bg-background-dark rounded-2xl p-6 border border-border hover:border-accent-green transition-all duration-300 flex flex-col h-full relative overflow-hidden group">
      {discount > 0 && (
        <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
          <Tag className="w-3 h-3" />
          {discount * 100}% OFF
        </div>
      )}

      <div className="flex items-start justify-between mb-4 mt-2">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getCategoryColor(reward.category)}`}>
          {getCategoryIcon(reward.category)}
        </div>
        <div className="flex flex-col items-end">
          {discount > 0 && (
            <span className="text-xs text-muted-foreground line-through mb-0.5">
              {reward.token_cost} tokens
            </span>
          )}
          <Badge variant="outline" className={discount > 0 ? "border-civic-guardian text-civic-guardian" : "border-accent-green text-accent-green"}>
            {discountedCost} tokens
          </Badge>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{reward.reward_name}</h3>
      <p className="text-sm text-muted-foreground mb-4 flex-1">{reward.description || 'Redeem your green tokens for this reward'}</p>

      {reward.redemption_count > 0 && (
        <p className="text-xs text-muted-foreground mb-4">
          Redeemed {reward.redemption_count} times
        </p>
      )}

      <div className="mt-auto">
        <Button
          onClick={() => onRedeem(reward, discountedCost)}
          disabled={!canAfford}
          className={`w-full transition-all duration-200 ${canAfford ? 'bg-accent-green text-background-dark hover:bg-accent-green-dark hover:-translate-y-0.5 hover:shadow-lg' : 'opacity-50 cursor-not-allowed pointer-events-none'}`}
        >
          {canAfford ? 'Redeem Now' : 'Insufficient Tokens'}
        </Button>
        {!canAfford && (
          <p className="text-xs text-destructive text-center mt-2">
            Need {discountedCost - userTokens} more tokens
          </p>
        )}
      </div>
    </div>
  );
};

export default RewardsCard;
