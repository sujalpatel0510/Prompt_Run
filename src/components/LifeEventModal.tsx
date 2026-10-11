import React, { useState } from 'react';
import { 
  Dices, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Sparkles
} from 'lucide-react';
import { LifeEvent } from '../types/finance';
import { LIFE_EVENTS_POOL } from '../data/initialData';
import { sounds } from '../utils/audio';

interface LifeEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyEvent: (event: LifeEvent, accepted: boolean) => void;
  currentDay: number;
}

export const LifeEventModal: React.FC<LifeEventModalProps> = ({
  isOpen,
  onClose,
  onApplyEvent,
  currentDay,
}) => {
  const [activeEvent, setActiveEvent] = useState<LifeEvent>(LIFE_EVENTS_POOL[0]);

  if (!isOpen) return null;

  const handleRollDice = () => {
    sounds.playClick();
    const randomIdx = Math.floor(Math.random() * LIFE_EVENTS_POOL.length);
    setActiveEvent(LIFE_EVENTS_POOL[randomIdx]);
  };

  const handleChoice = (accepted: boolean) => {
    if (activeEvent.type === 'income') {
      sounds.playSuccess();
    } else if (accepted) {
      sounds.playWarning();
    } else {
      sounds.playClick();
    }
    onApplyEvent(activeEvent, accepted);
    onClose();
  };

  const isWindfall = activeEvent.type === 'income';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 lg:p-8 border border-purple-500/30 shadow-2xl animate-scale-up relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4 w-fit">
          <Dices className="w-3.5 h-3.5" />
          Day {currentDay} Wild Card Fate Draw
        </div>

        <h3 className="text-2xl font-extrabold text-white mb-2">
          {activeEvent.title}
        </h3>

        <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase mb-4 tracking-wider bg-slate-800 text-slate-300">
          Tag: {activeEvent.tag}
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {activeEvent.description}
        </p>

        {/* Financial Consequence Card */}
        <div className={`p-4 rounded-2xl border mb-6 flex items-center justify-between ${
          isWindfall
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isWindfall ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
              {isWindfall ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold opacity-80 block">
                {isWindfall ? 'Cash Inflow' : 'Unplanned Outflow'}
              </span>
              <span className="text-xl font-extrabold font-mono">
                {isWindfall ? '+' : '-'}₹{activeEvent.amount.toLocaleString()}
              </span>
            </div>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/30">
            Severity: {activeEvent.severity.toUpperCase()}
          </span>
        </div>

        {/* Action Choice Buttons */}
        <div className="space-y-2.5">
          {isWindfall ? (
            <button
              onClick={() => handleChoice(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Claim Windfall (+₹{activeEvent.amount})
            </button>
          ) : activeEvent.tag === 'Accident' || activeEvent.tag === 'Campus Fine' ? (
            <button
              onClick={() => handleChoice(true)}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-lg shadow-rose-600/20 transition-all"
            >
              Pay Obligatory Bill (-₹{activeEvent.amount})
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChoice(true)}
                className="py-3 px-3 rounded-xl bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/40 text-rose-200 font-bold text-xs transition-all"
              >
                Accept & Pay (-₹{activeEvent.amount})
              </button>
              <button
                onClick={() => handleChoice(false)}
                className="py-3 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-bold text-xs transition-all"
              >
                Resist FOMO (Save ₹{activeEvent.amount})
              </button>
            </div>
          )}

          {/* Roll Again */}
          <button
            onClick={handleRollDice}
            className="w-full py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Dices className="w-3.5 h-3.5 text-purple-400" />
            <span>Draw a Different Life Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
