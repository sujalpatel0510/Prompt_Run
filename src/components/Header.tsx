import React from 'react';
import { 
  Zap, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Dices, 
  Sparkles,
  Calendar,
  Share2
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  currentDay: number;
  onSetDay: (day: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenLifeEvent: () => void;
  onResetData: () => void;
  onLoadScenario: (scenario: 'baseline' | 'day1' | 'crisis' | 'frugal') => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDay,
  onSetDay,
  soundEnabled,
  onToggleSound,
  onOpenLifeEvent,
  onResetData,
  onLoadScenario,
  onOpenExport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Gen-Z Tag */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Kuber<span className="text-emerald-400">Z</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  ₹10K / 30D Vibe
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Gen Z Financial Cockpit & Decision Simulator
              </p>
            </div>
          </div>

          {/* Mobile Quick Action Pill */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playClick();
                onOpenLifeEvent();
              }}
              className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
              title="Draw Life Event"
            >
              <Dices className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleSound}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title="Toggle Audio"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Day Controller & Scenarios */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 w-full md:w-auto">
          {/* Day Stepper Pill */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 mr-2" />
            <span className="text-xs font-semibold text-slate-400 mr-2">Timeline:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-emerald-400 font-mono">Day {currentDay}</span>
              <span className="text-xs text-slate-500">/ 30</span>
            </div>
            <div className="ml-3 pl-2 border-l border-slate-800 flex items-center gap-1">
              <button
                disabled={currentDay <= 1}
                onClick={() => {
                  sounds.playClick();
                  onSetDay(Math.max(1, currentDay - 1));
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
              >
                -
              </button>
              <button
                disabled={currentDay >= 30}
                onClick={() => {
                  sounds.playClick();
                  onSetDay(Math.min(30, currentDay + 1));
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Scenario Quick-Loader */}
          <div className="relative">
            <select
              aria-label="Preset Scenario"
              onChange={(e) => {
                sounds.playCoin();
                onLoadScenario(e.target.value as any);
              }}
              className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 rounded-xl px-2.5 py-2 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
              defaultValue="baseline"
            >
              <option value="baseline">📍 Preset: Day 8 Realistic (Active)</option>
              <option value="day1">🌱 Preset: Day 1 Fresh Start (₹10,000)</option>
              <option value="crisis">🚨 Preset: Day 15 Crisis (Tight Cash)</option>
              <option value="frugal">🧘 Preset: Day 10 Frugal Monk</option>
            </select>
          </div>

          {/* Draw Fate Event */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenLifeEvent();
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-purple-500/30 text-purple-300 text-xs font-semibold shadow-sm transition-all"
          >
            <Dices className="w-3.5 h-3.5 text-purple-400" />
            <span>Draw Life Event</span>
          </button>

          {/* Export Report */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenExport();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium hover:border-slate-700 transition-all"
            title="Share & Export Report"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Report</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="hidden md:inline-flex p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={() => {
              sounds.playWarning();
              onResetData();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/40 transition-all"
            title="Reset Everything to Default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
