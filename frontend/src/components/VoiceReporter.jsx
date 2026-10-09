import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, CheckCircle, RefreshCw, X, ShieldAlert, Globe, Radio } from 'lucide-react';

export default function VoiceReporter({ onConfirmVoiceReport }) {
  const [selectedLanguage, setSelectedLanguage] = useState('mixed'); // 'en-IN' | 'ta-IN' | 'mixed'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [permissionState, setPermissionState] = useState('ready'); // 'ready' | 'denied' | 'listening' | 'error'
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionState('listening');
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        let confidence = null;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
          if (event.results[i][0].confidence) {
            confidence = event.results[i][0].confidence;
          }
        }
        setTranscript(currentTranscript);
        if (confidence) setConfidenceScore(confidence);
      };

      recognition.onend = () => {
        setIsListening(false);
        setPermissionState('ready');
        if (transcript.trim()) {
          setShowConfirmation(true);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setPermissionState('denied');
        } else {
          setPermissionState('error');
        }
      };

      setRecognitionInstance(recognition);
    } else {
      setSpeechSupported(false);
    }
  }, [transcript]);

  // Update recognition language dynamically
  useEffect(() => {
    if (recognitionInstance) {
      if (selectedLanguage === 'en-IN') {
        recognitionInstance.lang = 'en-IN';
      } else if (selectedLanguage === 'ta-IN') {
        recognitionInstance.lang = 'ta-IN';
      } else {
        // Mixed Tanglish preference (primary ta-IN with English fallback)
        recognitionInstance.lang = 'ta-IN';
      }
    }
  }, [selectedLanguage, recognitionInstance]);

  const startListening = () => {
    if (!speechSupported || !recognitionInstance) return;
    setTranscript('');
    setConfidenceScore(null);
    setShowConfirmation(false);
    try {
      recognitionInstance.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
    }
  };

  const stopListening = () => {
    if (recognitionInstance && isListening) {
      recognitionInstance.stop();
      setIsListening(false);
      if (transcript.trim()) {
        setShowConfirmation(true);
      }
    }
  };

  // Simulate or set spoken test scenario
  const setDemoTranscript = (demoText, demoConfidence = 0.92) => {
    setTranscript(demoText);
    setConfidenceScore(demoConfidence);
    setShowConfirmation(true);
  };

  // Multilingual Logistics Entity Extraction
  const parseEntities = (rawText) => {
    const text = rawText.toLowerCase();

    let route = 'R03';
    if (text.includes('r01') || text.includes('r1')) route = 'R01';
    else if (text.includes('r02') || text.includes('r2')) route = 'R02';
    else if (text.includes('r03') || text.includes('r3') || text.includes('வழியில்')) route = 'R03';
    else if (text.includes('r04') || text.includes('r4')) route = 'R04';
    else if (text.includes('r05') || text.includes('r5')) route = 'R05';

    let category = 'VEHICLE';
    let type = 'ENGINE_ISSUE';

    if (text.includes('accident') || text.includes('விபத்து')) {
      category = 'VEHICLE';
      type = 'ACCIDENT';
    } else if (text.includes('tyre') || text.includes('puncture') || text.includes('டயர்')) {
      category = 'VEHICLE';
      type = 'FLAT_TYRE';
    } else if (text.includes('rain') || text.includes('மழை') || text.includes('கனமழை')) {
      category = 'NATURAL_DISASTER';
      type = 'HEAVY_RAIN';
    } else if (text.includes('flood') || text.includes('வெள்ளம்')) {
      category = 'NATURAL_DISASTER';
      type = 'FLOOD';
    } else if (text.includes('block') || text.includes('பிளாக்') || text.includes('மூடப்பட்டுள்ளது')) {
      category = 'NATURAL_DISASTER';
      type = 'LANDSLIDE';
    }

    return { route, category, type };
  };

  const extracted = parseEntities(transcript);

  // Confidence Rating Text
  const getConfidenceBadge = () => {
    if (!confidenceScore) return { label: 'Please verify transcript', color: 'bg-slate-100 text-slate-700' };
    if (confidenceScore >= 0.82) return { label: 'High Confidence (Voice recognized clearly)', color: 'bg-emerald-100 text-emerald-800' };
    if (confidenceScore >= 0.65) return { label: 'Medium Confidence (Please verify)', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Low Confidence (Please speak again or verify)', color: 'bg-red-100 text-red-800' };
  };

  const confidenceBadge = getConfidenceBadge();

  const handleConfirmSubmit = () => {
    if (!transcript.trim()) return;
    onConfirmVoiceReport({
      originalTranscript: transcript,
      normalizedTranscript: transcript,
      language: selectedLanguage,
      confidence: confidenceScore,
      routeId: extracted.route,
      category: extracted.category,
      type: extracted.type,
      description: transcript
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
      {/* Header & Positioning Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-extrabold text-slate-900">🎙 VOICE REPORTING SYSTEM</h3>
            <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
              Multilingual (English • தமிழ்)
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Multilingual voice-assisted reporting with Tanglish support, confidence-aware transcription, and driver verification.
          </p>
        </div>
      </div>

      {/* Language Selector Dropdown */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
          <Globe className="w-4 h-4 text-orange-600" />
          <span>🎙 Voice Language Selector</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedLanguage('mixed')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${
              selectedLanguage === 'mixed'
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🌐 Tamil + English
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('ta-IN')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${
              selectedLanguage === 'ta-IN'
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🇮🇳 தமிழ் (Tamil)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLanguage('en-IN')}
            className={`py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all border ${
              selectedLanguage === 'en-IN'
                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            🇬🇧 English (India)
          </button>
        </div>
      </div>

      {/* Mic Status & Error Fallbacks */}
      {!speechSupported && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-amber-900 font-medium">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            Voice input is unavailable in this browser environment. Please use <strong>TAP</strong> or <strong>TEXT</strong> options below.
          </span>
        </div>
      )}

      {permissionState === 'denied' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3 text-xs text-red-900 font-medium">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>Microphone permission is required for voice reporting. Please grant mic access or use Tap report.</span>
        </div>
      )}

      {/* Main Microphone Button */}
      {speechSupported && permissionState !== 'denied' && (
        <div className="space-y-4">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={`w-full py-6 rounded-3xl font-black text-lg flex flex-col items-center justify-center space-y-1 transition-all shadow-lg ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white pulse-red'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20'
            }`}
          >
            {isListening ? (
              <>
                <div className="flex items-center space-x-2">
                  <MicOff className="w-7 h-7 animate-bounce" />
                  <span>🔴 பேசுங்கள்... (Listening...)</span>
                </div>
                <span className="text-xs font-normal text-red-100">Click to stop recording</span>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <Mic className="w-7 h-7" />
                  <span>🎙 REPORT BY VOICE / குரல் பதிவு</span>
                </div>
                <span className="text-xs font-normal text-orange-100">Press to start speaking in Tamil or English</span>
              </>
            )}
          </button>

          {/* Quick Demo Test Buttons for Hackathon Presentation */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Quick Voice Test Scenarios (Click to test Tamil / Tanglish):
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoTranscript("R03 route-la engine problem aayiduchu", 0.94)}
                className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                "R03 route-la engine problem aayiduchu"
              </button>
              <button
                type="button"
                onClick={() => setDemoTranscript("R03 வழியில் வாகனத்தின் இன்ஜின் பழுதாகிவிட்டது", 0.91)}
                className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                "R03 வழியில் வாகனத்தின் இன்ஜின் பழுதாகிவிட்டது"
              </button>
              <button
                type="button"
                onClick={() => setDemoTranscript("Engine problem sir, R03-la vehicle stop aayiduchu", 0.88)}
                className="px-3 py-1.5 bg-white hover:bg-blue-50 border border-slate-200 rounded-xl text-slate-800 font-semibold"
              >
                "Engine problem sir, R03-la vehicle stop aayiduchu"
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Confirmation Card (Requirement: Driver Verification before send) */}
      {showConfirmation && transcript && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 border-2 border-blue-500 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
              <h4 className="font-extrabold text-base text-white">YOUR REPORT (உங்கள் குரல் பதிவு)</h4>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${confidenceBadge.color}`}>
              {confidenceBadge.label}
            </span>
          </div>

          {/* Original Recognized Transcript */}
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Original Recognized Speech:</span>
            <p className="text-base font-extrabold text-blue-300 italic">"{transcript}"</p>
          </div>

          {/* Structured Logistics Information Extraction */}
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              Extracted Logistics Information:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Route Code</span>
                <span className="font-black text-white">{extracted.route}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Category</span>
                <span className="font-bold text-slate-200">{extracted.category}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 text-[10px] block">Disruption Type</span>
                <span className="font-black text-amber-300">{extracted.type}</span>
              </div>
            </div>
          </div>

          {/* Explicit Driver Confirmation Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 uppercase tracking-wide"
            >
              <CheckCircle className="w-5 h-5" />
              <span>✓ Confirm & Send (உறுதிசெய்)</span>
            </button>

            <button
              type="button"
              onClick={startListening}
              className="py-4 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>↻ Speak Again (மீண்டும் பேசவும்)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowConfirmation(false);
                setTranscript('');
              }}
              className="py-4 px-4 bg-slate-800 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-2xl border border-red-500/30 flex items-center justify-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
