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
    return (
      <div className="max-w-6xl mx-auto p-12 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">Generating Recovery Intelligence Options & Scores...</p>
      </div>
    );
  }

  const options = recoveryData?.options || [];
  const recommended = recoveryData?.recommendedOption || options[0];
  const explanation = recoveryData?.explanation || "CHANGE VEHICLE was selected because it produces the lowest estimated delay (10 min) and removes the critical deadline risk.";

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in text-slate-900">
      {/* COMMAND HEADER */}
      <div className="command-card rail-green p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>RECOVERY INTELLIGENCE ENGINE</span>
            </span>
            <span className="text-xs text-slate-600 font-mono font-medium">MULTI-OBJECTIVE OPTIMIZER</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            RECOVERY DECISION & EXECUTION
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            Evaluates alternative dispatch vectors, minimizes total delay overhead, and enforces customer SLA compliance.
          </p>
        </div>
      </div>

      {/* RECOMMENDED ACTION BANNER */}
      {recommended && (
        <div className="command-card rail-orange p-6 sm:p-8 border-2 border-orange-500 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-500 text-white p-3.5 rounded-2xl shadow-md">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200">
                  ✦ RECOMMENDED RECOVERY ACTION
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-1">{recommended.title}</h2>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-200 text-right self-start sm:self-auto shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-600 block">RECOVERY SCORE</span>
              <span className="font-display text-3xl font-bold text-emerald-600">{recommended.score} <span className="text-xs text-slate-500 font-normal">/ 100</span></span>
            </div>
          </div>

          {/* Explainability Callout */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex items-center space-x-2 text-orange-700 text-xs font-bold">
              <Info className="w-4 h-4 text-orange-600 shrink-0" />
              <span>DECISION REASONING & EXPLAINABILITY</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              "{explanation}"
            </p>
          </div>

          {/* Key Recommended Action Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="space-y-1">
              <span className="text-slate-600 text-[10px] uppercase font-bold block">Strategy Type</span>
              <span className="font-display font-bold text-orange-600 text-sm block">{recommended.action_type}</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-600 text-[10px] uppercase font-bold block">Expected Delay</span>
              <span className="font-display font-bold text-emerald-600 text-sm block">+{recommended.estimated_delay_min} Minutes</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-600 text-[10px] uppercase font-bold block">Reassigned Dispatch</span>
              <span className="font-display font-bold text-slate-900 text-sm block">D101 → Standby V05</span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-600 text-[10px] uppercase font-bold block">Remaining Risks</span>
              <span className="font-display font-bold text-emerald-600 text-sm block">0 SLA Breaches</span>
            </div>
          </div>

          {/* Owner Decision Action Buttons */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              disabled={submitting}
              onClick={() => handleDecision('ACCEPT', recommended)}
              className="flex-1 min-w-[160px] py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 uppercase tracking-wider active:scale-95 border border-emerald-500/30"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>APPLY RECOVERY ACTION</span>
            </button>

            <button
              disabled={submitting}
              onClick={() => handleDecision('REJECT')}
              className="py-3.5 px-6 bg-white hover:bg-red-50 text-red-700 font-bold text-xs rounded-xl border border-red-200 shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <X className="w-4 h-4" />
              <span>REJECT</span>
            </button>

            <button
              disabled={submitting}
              onClick={() => handleDecision('MODIFY')}
              className="py-3.5 px-6 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>MODIFY ACTION</span>
            </button>
          </div>
        </div>
      )}

      {/* NEW PLAN CREATED CARD & SEND TO DRIVER BUTTON */}
      {(planStatus === 'APPROVED' || planStatus === 'SENT' || planStatus === 'DRIVER_ACKNOWLEDGED' || planStatus === 'IN_PROGRESS' || planStatus === 'COMPLETED') && (
        <div className="command-card rail-green p-6 sm:p-8 border-2 border-emerald-500 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 text-white p-3 rounded-2xl shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded border border-emerald-300">
                  RECOVERY PLAN APPROVED
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900 mt-1">Authorized Fleet Dispatch Plan</h3>
              </div>
            </div>
            <span className="text-xs font-bold bg-emerald-600 text-white px-4 py-1.5 rounded-full uppercase tracking-wider self-start sm:self-auto shadow-sm">
              STATUS: {planStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-600 font-bold block text-[10px] uppercase">Replacement Unit</span>
              <p className="font-display text-sm font-bold text-slate-900">V05 (Spare Van)</p>
            </div>
            <div>
              <span className="text-slate-600 font-bold block text-[10px] uppercase">Target Delivery</span>
              <p className="font-display text-sm font-bold text-slate-900">D101 (Apex Tech)</p>
            </div>
            <div>
              <span className="text-slate-600 font-bold block text-[10px] uppercase">Strategy</span>
              <p className="font-display text-sm font-bold text-amber-700">Reassigned to V05</p>
            </div>
            <div>
              <span className="text-slate-600 font-bold block text-[10px] uppercase">Expected Overhead</span>
              <p className="font-display text-sm font-bold text-emerald-600">10 Minutes</p>
            </div>
          </div>

          {planStatus === 'APPROVED' && (
            <button
              onClick={handleSendToDriver}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 uppercase tracking-wider active:scale-95"
            >
              <Send className="w-5 h-5" />
              <span>DISPATCH RECOVERY PLAN TO DRIVER</span>
            </button>
          )}

          {planStatus !== 'APPROVED' && (
            <div className="bg-emerald-50 p-4 rounded-2xl text-center text-xs font-bold text-emerald-800 border border-emerald-200">
              ✓ Dispatch instructions transmitted to driver dashboard. Awaiting driver acknowledgement.
            </div>
          )}
        </div>
      )}

      {/* BEFORE VS AFTER IMPACT COMPARISON CARD */}
      <BeforeAfterCard
        beforeMetrics={recoveryData?.beforeMetrics}
        afterMetrics={recoveryData?.afterMetrics}
      />

      {/* EVALUATED RECOVERY ACTION ALTERNATIVES */}
      <div className="command-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">Evaluated Recovery Alternatives ({options.length})</h3>
            <p className="text-xs text-slate-700 font-medium">Ranked by Recovery Intelligence Score</p>
          </div>
          <span className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            OPTIONS MATRIX
          </span>
        </div>

        <div className="space-y-3">
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => setSelectedOption(opt)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                selectedOption?.id === opt.id
                  ? 'bg-orange-50/50 border-orange-500 shadow-md ring-2 ring-orange-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-display font-bold text-sm text-slate-900">{opt.title}</h4>
                  {opt.id === recommended?.id && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                      ★ Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 font-medium">{opt.description}</p>
                <p className="text-[11px] text-slate-600 italic mt-0.5">{opt.resource_notes}</p>
              </div>

              <div className="flex items-center space-x-4 shrink-0 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-slate-600 font-bold block uppercase">Est. Delay</span>
                  <span className="font-display text-sm font-bold text-slate-900">+{opt.estimated_delay_min} min</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-600 font-bold block uppercase">Score</span>
                  <span className="font-display text-base font-bold text-orange-600">{opt.score}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOption(opt);
                    handleDecision('ACCEPT', opt);
                  }}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
                >
                  SELECT ACTION
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

