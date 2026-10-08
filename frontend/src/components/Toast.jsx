import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const bgColors = {
    success: 'bg-emerald-900 border-emerald-500 text-emerald-100',
    error: 'bg-red-900 border-red-500 text-red-100',
    warning: 'bg-amber-900 border-amber-500 text-amber-100',
    info: 'bg-slate-900 border-blue-500 text-slate-100'
  };

  const Icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  };

  const IconComp = Icons[type] || Info;

  return (
    <div className={`fixed bottom-5 right-5 z-50 max-w-md border shadow-2xl rounded-xl p-4 flex items-start space-x-3 transition-all ${bgColors[type]}`}>
      <IconComp className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 text-xs font-semibold">{message}</div>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
