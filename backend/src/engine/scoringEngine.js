/**
 * Recovery Scoring Engine: Evaluates recovery options deterministically (0-100 score).
 */

function scoreRecoveryOptions(options, impactData) {
  const scoredOptions = options.map(option => {
    let score = 100;

    // 1. Penalty for estimated delay (1.2 points per minute of delay)
    score -= option.estimated_delay_min * 1.2;

    // 2. Heavy penalty for remaining critical risks
    score -= option.critical_risks_remaining * 35;

    // 3. Action type adjustments
    switch (option.action_type) {
      case 'CHANGE_VEHICLE':
        // High bonus if available replacement vehicle exists and eliminates risk
        score += 25;
        break;
      case 'USE DRONE':
      case 'USE_DRONE':
        // Good alternative, slightly higher operational complexity
        score += 15;
        break;
      case 'NEW_ROUTE':
        // Standard detour, but still has delay
        score += 5;
        break;
      case 'RESCHEDULE':
        score -= 15;
        break;
      case 'CANCEL_DELIVERY':
        score -= 50;
        break;
      default:
        break;
    }

    // Clamp score between 0 and 100
    const finalScore = Math.min(100, Math.max(0, Math.round(score)));

    return {
      ...option,
      score: finalScore
    };
  });

  // Sort descending by score
  scoredOptions.sort((a, b) => b.score - a.score);

  const recommendedOption = scoredOptions[0];

  // Generate data-driven explanation
  let explanation = '';
  if (recommendedOption.action_type === 'CHANGE_VEHICLE') {
    explanation = `${recommendedOption.title} was selected with top score (${recommendedOption.score}/100) because it minimizes estimated delay to only ${recommendedOption.estimated_delay_min} minutes, completely eliminates the critical deadline risk for delivery ${recommendedOption.target_delivery_code}, and leverages available standby vehicle ${recommendedOption.new_vehicle_code}.`;
  } else if (recommendedOption.action_type === 'USE_DRONE') {
    explanation = `${recommendedOption.title} was selected with score (${recommendedOption.score}/100) because it provides rapid aerial delivery in ${recommendedOption.estimated_delay_min} minutes, bypassing road obstacles for critical shipment ${recommendedOption.target_delivery_code}.`;
  } else if (recommendedOption.action_type === 'NEW_ROUTE') {
    explanation = `${recommendedOption.title} was selected with score (${recommendedOption.score}/100) as the most direct rerouting strategy, keeping all deliveries on a single vehicle with ${recommendedOption.estimated_delay_min} minutes expected delay.`;
  } else {
    explanation = `${recommendedOption.title} was selected as the optimal action with score ${recommendedOption.score}/100 based on calculated SLA and resource trade-offs.`;
  }

  // Calculate BEFORE vs AFTER metrics
  const beforeMetrics = {
    potential_delay_min: impactData.baseDelayMin,
    critical_risks_count: 1,
    affected_deliveries_count: impactData.deliveries.length
  };

  const afterMetrics = {
    potential_delay_min: recommendedOption.estimated_delay_min,
    critical_risks_count: recommendedOption.critical_risks_remaining,
    affected_deliveries_count: recommendedOption.affected_deliveries_count,
    delay_avoided_min: impactData.baseDelayMin - recommendedOption.estimated_delay_min
  };

  return {
    scoredOptions,
    recommendedOption,
    explanation,
    beforeMetrics,
    afterMetrics
  };
}

module.exports = {
  scoreRecoveryOptions
};
