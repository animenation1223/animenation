import React from 'react';
import { MapPin, CreditCard, CheckCircle } from 'lucide-react';

const STEPS = [
  { num: 1, label: 'Address', icon: MapPin },
  { num: 2, label: 'Payment', icon: CreditCard },
  { num: 3, label: 'Review', icon: CheckCircle },
];

export default function CheckoutSteps({ step, onStepClick }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const isActive = step === s.num;
        const isDone = step > s.num;
        return (
          <React.Fragment key={s.num}>
            <button
              onClick={() => isDone && onStepClick(s.num)}
              disabled={!isDone}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-syne font-bold transition-all border ${
                isActive
                  ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_12px_rgba(255,31,68,0.1)]'
                  : isDone
                    ? 'bg-green-500/10 text-green-400 border-green-500/20 cursor-pointer hover:bg-green-500/15'
                    : 'bg-card text-muted-foreground border-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{s.label}</span>
              {isDone && <span className="text-green-400 text-xs">✓</span>}
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px transition-colors ${step > s.num ? 'bg-green-500/30' : 'bg-white/5'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}