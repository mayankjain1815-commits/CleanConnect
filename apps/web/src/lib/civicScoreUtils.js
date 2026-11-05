
export const POINTS_MAP = {
  Accurate_Segregation: 30,
  Daily_Pickup_Verified: 15,
  Streak_Bonus: 5,
  False_Complaint: -50,
};

export const calculateTier = (score) => {
  if (score >= 751) return 'Elite Guardian';
  if (score >= 551) return 'Civic Champion';
  return 'Eco-Novice';
};

export const updateCivicScore = async (pb, citizenId, reason) => {
  try {
    // 1. Fetch current score
    const records = await pb.collection('civic_scores').getFullList({
      filter: `citizen_id = "${citizenId}"`,
      $autoCancel: false,
    });

    let civicScoreRecord;
    let currentScore = 300;

    if (records.length > 0) {
      civicScoreRecord = records[0];
      currentScore = civicScoreRecord.current_score;
    } else {
      // Create initial score record if it doesn't exist
      civicScoreRecord = await pb.collection('civic_scores').create(
        {
          citizen_id: citizenId,
          current_score: 300,
          tier_rank: 'Eco-Novice',
        },
        { $autoCancel: false }
      );
    }

    // 2. Calculate new score and bounds
    const pointsChanged = POINTS_MAP[reason] || 0;
    let newScore = currentScore + pointsChanged;
    
    if (newScore > 900) newScore = 900;
    if (newScore < 300) newScore = 300;

    const newTier = calculateTier(newScore);

    // 3. Update civic_scores
    await pb.collection('civic_scores').update(
      civicScoreRecord.id,
      {
        current_score: newScore,
        tier_rank: newTier,
      },
      { $autoCancel: false }
    );

    // 4. Create ledger entry (Note: May fail if caller is not Admin depending on PB rules, 
    // gracefully catch so we don't break the frontend flow for citizens)
    try {
      await pb.collection('civic_score_ledger').create(
        {
          citizen_id: citizenId,
          points_changed: pointsChanged,
          new_score: newScore,
          reason: reason,
        },
        { $autoCancel: false }
      );
    } catch (ledgerError) {
      console.warn('Could not create ledger entry (requires Admin access):', ledgerError.message);
    }

    return { newScore, newTier, pointsChanged };
  } catch (error) {
    console.error('Error updating civic score:', error);
    throw error;
  }
};
