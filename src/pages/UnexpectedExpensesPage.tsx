import { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { LifeEventModal } from '../components/LifeEventModal';
import { Sparkles } from 'lucide-react';

export function UnexpectedExpensesPage() {
  const { currentDay, handleApplyLifeEvent } = useFinancial();
  const [open, setOpen] = useState(false);

  return (
    <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/50 max-w-3xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4">
        <Sparkles className="w-7 h-7 text-amber-400" />
      </div>
      <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-2">Unexpected Expenses</h1>
      <p className="text-sm text-slate-400 mb-6">
        Draw a life-event card to simulate emergencies — cracked screens, medical bills, freelance
        windfalls — and see the immediate impact on your balance, daily allowance, and month-end
        forecast before it becomes permanent.
      </p>
      <button className="btn-primary" onClick={() => setOpen(true)}>Draw a Life Event Card</button>
      <LifeEventModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onApplyEvent={handleApplyLifeEvent}
        currentDay={currentDay}
      />
    </div>
  );
}
