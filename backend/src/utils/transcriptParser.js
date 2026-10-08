/**
 * Multilingual Logistics Transcript Parser (English, Tamil, Tanglish)
 */

function parseTranscript(transcript = '') {
  const text = transcript.toLowerCase().trim();
  if (!text) {
    return {
      routeId: 'R03',
      category: 'VEHICLE',
      type: 'ENGINE_ISSUE',
      confidence: 'LOW',
      extractedDescription: 'Unspecified disturbance reported via voice',
      hasFullExtraction: false
    };
  }

  // 1. Extract Route Code (R01 to R05, or "r03", "r 03", "route 3", "வழியில்")
  let routeId = null;
  const routeMatch = text.match(/\b(r\s?0?[1-5])\b/i) || text.match(/route\s?0?([1-5])/i);
  if (routeMatch) {
    const num = routeMatch[1].replace(/\D/g, '');
    routeId = `R0${num}`;
  } else if (text.includes('r03') || text.includes('r3') || text.includes('வழியில்')) {
    routeId = 'R03';
  } else if (text.includes('r01') || text.includes('r1')) {
    routeId = 'R01';
  } else if (text.includes('r02') || text.includes('r2')) {
    routeId = 'R02';
  } else if (text.includes('r04') || text.includes('r4')) {
    routeId = 'R04';
  } else if (text.includes('r05') || text.includes('r5')) {
    routeId = 'R05';
  } else {
    routeId = 'R03'; // Default fallback route for demo
  }

  // 2. Disturbance Category & Type Parser (Tamil, Tanglish, English)
  let category = 'VEHICLE';
  let type = 'ENGINE_ISSUE';
  let matchedKeyword = null;

  // Engine Issue
  if (
    text.includes('engine') ||
    text.includes('இன்ஜின்') ||
    text.includes('பழுது') ||
    text.includes('பிரச்சனை') ||
    text.includes('engine problem') ||
    text.includes('stop aayiduchu')
  ) {
    category = 'VEHICLE';
    type = 'ENGINE_ISSUE';
    matchedKeyword = 'Engine Issue / இன்ஜின் பழுது';
  }
  // Accident
  else if (
    text.includes('accident') ||
    text.includes('விபத்து') ||
    text.includes('crash') ||
    text.includes('மோதி')
  ) {
    category = 'VEHICLE';
    type = 'ACCIDENT';
    matchedKeyword = 'Accident / விபத்து';
  }
  // Flat Tyre
  else if (
    text.includes('flat tyre') ||
    text.includes('tyre') ||
    text.includes('puncture') ||
    text.includes('டயர் பஞ்சர்') ||
    text.includes('டயர்')
  ) {
    category = 'VEHICLE';
    type = 'FLAT_TYRE';
    matchedKeyword = 'Flat Tyre / டயர் பஞ்சர்';
  }
  // Breakdown
  else if (
    text.includes('breakdown') ||
    text.includes('பழுதானது') ||
    text.includes('வாகனம் பழுது') ||
    text.includes('stopped') ||
    text.includes('நின்றுவிட்டது')
  ) {
    category = 'VEHICLE';
    type = 'BREAKDOWN';
    matchedKeyword = 'Breakdown / வாகனம் பழுதானது';
  }
  // Fuel Problem
  else if (
    text.includes('fuel') ||
    text.includes('petrol') ||
    text.includes('diesel') ||
    text.includes('எரிபொருள்')
  ) {
    category = 'VEHICLE';
    type = 'FUEL_PROBLEM';
    matchedKeyword = 'Fuel Problem / எரிபொருள் பிரச்சனை';
  }
  // Heavy Rain
  else if (
    text.includes('rain') ||
    text.includes('கனமழை') ||
    text.includes('மழை')
  ) {
    category = 'NATURAL_DISASTER';
    type = 'HEAVY_RAIN';
    matchedKeyword = 'Heavy Rain / கனமழை';
  }
  // Flood
  else if (
    text.includes('flood') ||
    text.includes('வெள்ளம்') ||
    text.includes('water overflow')
  ) {
    category = 'NATURAL_DISASTER';
    type = 'FLOOD';
    matchedKeyword = 'Flood / வெள்ளம்';
  }
  // Road Block / Landslide
  else if (
    text.includes('road block') ||
    text.includes('road closure') ||
    text.includes('சாலை மூடப்பட்டுள்ளது') ||
    text.includes('ரோடு பிளாக்') ||
    text.includes('landslide')
  ) {
    category = 'NATURAL_DISASTER';
    type = 'LANDSLIDE';
    matchedKeyword = 'Road Block / ரோடு பிளாக்';
  }

  const hasFullExtraction = !!routeId && !!type;

  return {
    routeId: routeId || 'R03',
    category,
    type,
    matchedKeyword,
    extractedDescription: `Voice report: ${type.replace('_', ' ')} detected on Route ${routeId || 'R03'}`,
    hasFullExtraction
  };
}

module.exports = {
  parseTranscript
};
