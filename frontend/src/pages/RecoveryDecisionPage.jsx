import React, { useState, useEffect } from 'react';
import BeforeAfterCard from '../components/BeforeAfterCard';
import { Award, Check, X, Edit3, Send, AlertTriangle, ShieldCheck, Zap, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function RecoveryDecisionPage({ disturbanceId, onSendSuccess, showToast }) {
  const [recoveryData, setRecoveryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [planStatus, setPlanStatus] = useState('DRAFT'); // 'DRAFT' | 'APPROVED' | 'REJECTED' | 'MODIFIED' | 'SENT'
  const [submitting, setSubmitting] = useState(false);

  const fetchRecovery = async () => {
    try {
      const id = disturbanceId || 'DIST_DEMO_R03';
      const data = await api.generateRecovery(id);
      setRecoveryData(data);
      if (data.recommendedOption) {
        setSelectedOption(data.recommendedOption);
      }
      if (data.plan && data.plan.status) {
        setPlanStatus(data.plan.status);
      }
    } catch (err) {
      console.error('Failed to generate recovery options:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecovery();
  }, [disturbanceId]);

  const handleDecision = async (decisionType, optionToUse = null) => {
    setSubmitting(true);
    try {
      const targetOption = optionToUse || selectedOption;
      const planId = recoveryData?.plan?.id || 'DIST_DEMO_R03';
      const res = await api.handleDecision(planId, decisionType, targetOption?.id);
      
      setPlanStatus(res.plan.status);
      showToast(`Recovery Action ${decisionType}ED by Owner! Status: ${res.plan.status}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to process decision', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendToDriver = async () => {
    setSubmitting(true);
    try {
      const planId = recoveryData?.plan?.id || 'DIST_DEMO_R03';
      await api.sendPlanToDriver(planId);
      setPlanStatus('SENT');
      showToast('✓ New Plan sent directly to Driver Dashboard!', 'success');
      if (onSendSuccess) onSendSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to send plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 font-bold">Generating Recovery Intelligence Options & Scores...</div>;
  }

  const options = recoveryData?.options || [];
  const recommended = recoveryData?.recommendedOption || options[0];
  const explanation = recoveryData?.explanation || "CHANGE VEHICLE was selected because it produces the lowest estimated delay (10 min) and removes the critical deadline risk.";

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
          Recovery Intelligence Engine
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-2">ALTERNATIVE ACTIONS & RECOVERY DECISION</h1>
        <p className="text-xs text-slate-500 font-medium">Deterministic scoring engine evaluates delay, SLA risk, and vehicle readiness</p>
      </div>

      {/* RECOMMENDED ACTION BANNER (Requirement #13 & #30 Explainability) */}
      {recommended && (
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 border-2 border-blue-500 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  TOP RECOMMENDATION
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">{recommended.title}</h2>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Recovery Score</span>
              <span className="text-2xl font-black text-emerald-400">{recommended.score}/100</span>
            </div>
          </div>

          {/* Explainability Callout (Requirement #30) */}
          <div className="bg-blue-950/70 border border-blue-500/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-blue-300 text-xs font-extrabold">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>EXPLAINABILITY: WHY THIS ACTION WAS SELECTED</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              "{explanation}"
            </p>
          </div>

          {/* Key Recommended Action Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Action Type</span>
              <span className="font-extrabold text-blue-400">{recommended.action_type}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Estimated Delay</span>
              <span className="font-extrabold text-emerald-400">{recommended.estimated_delay_min} Minutes</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Reassigned Delivery</span>
              <span className="font-bold text-white">D101 → Standby V05</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Remaining Risks</span>
              <span className="font-extrabold text-emerald-400">0 Critical Risks</span>
            </div>
          </div>

          {/* Owner Decision Action Buttons (Requirement #14) */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              disabled={submitting}
              onClick={() => handleDecision('ACCEPT', recommended)}
              className="flex-1 min-w-[140px] py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 uppercase tracking-wide"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>✓ Accept Action</span>
            </button>

            <button
              disabled={submitting}
              onClick={() => handleDecision('REJECT')}
              className="py-3.5 px-6 bg-slate-800 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 transition-all flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>✕ Reject</span>
            </button>

            <button
              disabled={submitting}
              onClick={() => handleDecision('MODIFY')}
              className="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>✎ Modify Action</span>
            </button>
          </div>
        </div>
      )}

      {/* NEW PLAN CREATED CARD & SEND TO DRIVER BUTTON (Requirements #15 & #16) */}
      {(planStatus === 'APPROVED' || planStatus === 'SENT' || planStatus === 'DRIVER_ACKNOWLEDGED' || planStatus === 'IN_PROGRESS' || planStatus === 'COMPLETED') && (
        <div className="bg-emerald-900 text-white rounded-3xl p-6 border-2 border-emerald-500 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500 text-slate-950 p-2.5 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  NEW PLAN CREATED
                </span>
                <h3 className="text-lg font-extrabold text-white mt-0.5">Approved Delivery Recovery Plan</h3>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-500 text-slate-950 px-3 py-1 rounded-full uppercase">
              STATUS: {planStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-950/80 p-4 rounded-xl border border-emerald-800 text-xs">
            <div>
              <span className="text-emerald-400 font-bold block text-[10px] uppercase">Replacement Vehicle</span>
              <p className="text-sm font-extrabold text-white">V05 (Spare Van)</p>
            </div>
            <div>
              <span className="text-emerald-400 font-bold block text-[10px] uppercase">Target Delivery</span>
              <p className="text-sm font-extrabold text-white">D101 (Apex Tech)</p>
            </div>
            <div>
              <span className="text-emerald-400 font-bold block text-[10px] uppercase">Action Strategy</span>
              <p className="text-sm font-bold text-amber-300">Reassigned to V05</p>
            </div>
            <div>
              <span className="text-emerald-400 font-bold block text-[10px] uppercase">Expected Delay</span>
              <p className="text-sm font-extrabold text-emerald-300">10 Minutes</p>
            </div>
          </div>

          {planStatus === 'APPROVED' && (
            <button
              onClick={handleSendToDriver}
              className="w-full py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 uppercase tracking-wide"
            >
              <Send className="w-5 h-5" />
              <span>Send Plan to Driver</span>
            </button>
          )}

          {planStatus !== 'APPROVED' && (
            <div className="bg-emerald-950/60 p-3 rounded-xl text-center text-xs font-bold text-emerald-300 border border-emerald-800">
              ✓ Plan sent to driver dashboard. Awaiting driver acknowledgement.
            </div>
          )}
        </div>
      )}

      {/* BEFORE VS AFTER IMPACT COMPARISON CARD (Requirement #18) */}
      <BeforeAfterCard
        beforeMetrics={recoveryData?.beforeMetrics}
        afterMetrics={recoveryData?.afterMetrics}
      />

      {/* All Generated Recovery Action Options List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-base text-slate-900">Evaluated Recovery Action Alternatives ({options.length})</h3>
          <span className="text-xs text-slate-500 font-medium">Ranked by Recovery Intelligence Score</span>
        </div>

        <div className="space-y-3">
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setSelectedOption(opt)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                selectedOption?.id === opt.id
                  ? 'bg-blue-50/50 border-blue-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-extrabold text-sm text-slate-900">{opt.title}</h4>
                  {opt.id === recommended?.id && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ★ Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 font-medium">{opt.description}</p>
                <p className="text-[11px] text-slate-400 italic mt-0.5">{opt.resource_notes}</p>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Est. Delay</span>
                  <span className="text-sm font-black text-slate-900">{opt.estimated_delay_min} min</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Score</span>
                  <span className="text-base font-black text-blue-600">{opt.score}/100</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOption(opt);
                    handleDecision('ACCEPT', opt);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg"
                >
                  Select Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
