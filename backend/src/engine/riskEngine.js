/**
 * Risk Engine: Calculates ETAs, deadline diffs, and risk classifications using deterministic logic.
 */

// Helper to convert HH:MM to minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + mins;
}

// Helper to convert minutes from midnight to HH:MM
function minutesToTime(totalMins) {
  const hours = Math.floor(totalMins / 60) % 24;
  const mins = totalMins % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function calculateDeliveryRisks(deliveries, delayMinutes) {
  let criticalRiskCount = 0;
  let highRiskCount = 0;
  let mediumRiskCount = 0;

  const analyzedDeliveries = deliveries.map(delivery => {
    const currentEtaMin = timeToMinutes(delivery.current_eta);
    const deadlineMin = timeToMinutes(delivery.deadline);
    
    const newEtaMin = currentEtaMin + delayMinutes;
    const newEta = minutesToTime(newEtaMin);
    
    const timeBufferMin = deadlineMin - currentEtaMin;
    const delayOverhead = delayMinutes - timeBufferMin; // positive means late

    let riskLevel = 'LOW';
    let riskReason = '';

    if (newEtaMin > deadlineMin) {
      if (delivery.priority === 'CRITICAL' || delayOverhead >= 5) {
        riskLevel = 'CRITICAL';
        criticalRiskCount++;
        riskReason = `New ETA (${newEta}) breaches deadline (${delivery.deadline}) by ${delayOverhead} mins!`;
      } else {
        riskLevel = 'HIGH';
        highRiskCount++;
        riskReason = `New ETA (${newEta}) slightly exceeds deadline (${delivery.deadline}) by ${delayOverhead} mins.`;
      }
    } else if (deadlineMin - newEtaMin <= 15) {
      riskLevel = 'MEDIUM';
      mediumRiskCount++;
      riskReason = `Tight buffer remaining (${deadlineMin - newEtaMin} mins before deadline ${delivery.deadline}).`;
    } else {
      riskLevel = 'LOW';
      riskReason = `Delivered within deadline (${deadlineMin - newEtaMin} mins buffer remaining).`;
    }

    return {
      ...delivery,
      original_eta: delivery.current_eta,
      new_eta: newEta,
      delay_minutes: delayMinutes,
      deadline_buffer_mins: deadlineMin - newEtaMin,
      risk_level: riskLevel,
      risk_reason: riskReason,
      is_deadline_at_risk: newEtaMin > deadlineMin
    };
  });

  return {
    analyzedDeliveries,
    summary: {
      critical_risks: criticalRiskCount,
      high_risks: highRiskCount,
      medium_risks: mediumRiskCount,
      total_affected: deliveries.length,
      total_delay_min: delayMinutes
    }
  };
}

module.exports = {
  timeToMinutes,
  minutesToTime,
  calculateDeliveryRisks
};
