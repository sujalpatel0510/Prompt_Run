import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Wallet,
  CalendarCheck,
  CreditCard,
  PiggyBank,
  Zap,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import { sounds } from '../utils/audio';

const LINKS = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/budget', label: 'Budget Planner', icon: Wallet },
  { to: '/commitments', label: 'Commitments', icon: CalendarCheck },
  { to: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { to: '/savings', label: 'Savings Goals', icon: PiggyBank },
  { to: '/unexpected', label: 'Unexpected', icon: Zap },
  { to: '/simulator', label: 'Simulator', icon: Sparkles, badge: 'Core' },
  { to: '/health', label: 'Health & Risk', icon: HeartPulse },
];

export function NavBar() {
  const location = useLocation();

  return (
    <nav aria-label="Primary" className="w-full border-b border-slate-800/70 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <ul role="tablist" className="flex items-center gap-1.5 py-2 min-w-max">
          {LINKS.map(link => {
            const Icon = link.icon;
            const active = location.pathname === link.to;
            return (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  role="tab"
                  aria-selected={active}
                  onClick={() => sounds.playClick()}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap focus-ring ${
                    active
                      ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden />
                  <span>{link.label}</span>
                  {'badge' in link && link.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-indigo-500/20 text-indigo-300">
                      {link.badge}
                    </span>
                  )}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-0 -bottom-px h-0.5 bg-emerald-500 hidden"
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
