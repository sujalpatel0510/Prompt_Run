'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Bot,
  Flame,
  HeartHandshake,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { FinancialHealthMetrics, Transaction, Subscription } from '../types/finance';
import { sounds } from '../utils/audio';
import { ScrollReveal } from './ui/Animations';

interface VibeCheckAdvisorProps {
  currentDay: number;
  liquidBalance: number;
  metrics: FinancialHealthMetrics;
  subscriptions: Subscription[];
  transactions: Transaction[];
}

export const VibeCheckAdvisor: React.FC<VibeCheckAdvisorProps> = ({
  metrics,
  subscriptions,
}) => {
  const [personality, setPersonality] = useState<'savage' | 'gentle'>('savage');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const generateDynamicInsights = () => {
    const insights: { title: string; body: string; type: 'warning' | 'tip' | 'praise' }[] = [];

    if (metrics.safeDailyAllowance < 150) {
      if (personality === 'savage') {
        insights.push({
          title: '🚨 Absolutely Cooked Allowance',
          body: `Bestie you have ₹${metrics.safeDailyAllowance}/day left. A single boba tea will put you in economic bankruptcy. Stick to hostel mess or tap water.`,
          type: 'warning',
        });
      } else {
        insights.push({
          title: '⚠️ Tight Daily Allowance',
          body: `Your safe spend is ₹${metrics.safeDailyAllowance}/day. Try meal-prepping or carpooling for the next few days to rebuild your buffer.`,
          type: 'warning',
        });
      }
    } else if (metrics.safeDailyAllowance >= 300) {
      if (personality === 'savage') {
        insights.push({
          title: '💅 High Roller (For Now)',
          body: `₹${metrics.safeDailyAllowance}/day is looking healthy! Don't let lifestyle creep convince you to buy that limited edition drop though.`,
          type: 'praise',
        });
      } else {
        insights.push({
          title: '✨ Healthy Daily Pace',
          body: `You are averaging ₹${metrics.safeDailyAllowance}/day, well aligned with your ₹10,000 baseline budget. Keep this pace steady!`,
          type: 'praise',
        });
      }
    }

    const activeSubs = subscriptions.filter((s) => s.active);
    const subCost = activeSubs.reduce((s, b) => s + b.cost, 0);
    if (subCost > 250) {
      if (personality === 'savage') {
        insights.push({
          title: '✂️ The Vampire Subscriptions',
          body: `You're burning ₹${subCost}/mo across ${activeSubs.length} subscriptions. Are you actually watching Netflix while listening to Spotify and coding with AI at the same time? Cut one.`,
          type: 'tip',
        });
      } else {
        insights.push({
          title: '💡 Subscription Optimization',
          body: `You have ₹${subCost}/mo tied up in recurring entertainment. Pausing even one subscription adds ₹5-10 back to your daily allowance.`,
          type: 'tip',
        });
      }
    }

    if (metrics.isDeficitProjected) {
      if (personality === 'savage') {
        insights.push({
          title: '💀 Month-End Crash Incoming',
          body: `Our financial model projects you hitting zero by Day ${metrics.deficitDay || 25}. Either grab a quick freelance gig or delete Swiggy right now.`,
          type: 'warning',
        });
      } else {
        insights.push({
          title: '📉 Deficit Prevention Needed',
          body: `At your current burn rate, you are projected to face a ₹${Math.abs(metrics.projectedEOMBalance)} deficit. Reducing daily discretionary spend by ₹80 will keep you solvent.`,
          type: 'warning',
        });
      }
    } else {
      if (personality === 'savage') {
        insights.push({
          title: '🛡️ Chief Financial Officer Aura',
          body: `Your projected Day 30 surplus is +₹${metrics.projectedEOMBalance}. Warren Buffett wishes he had your college budget discipline.`,
          type: 'praise',
        });
      } else {
        insights.push({
          title: '🌟 Positive Month-End Trajectory',
          body: `You're on track to conclude Day 30 with a +₹${metrics.projectedEOMBalance} surplus! Consider sweeping some of this into your Goa trip.`,
          type: 'praise',
        });
      }
    }

    return insights;
  };

  const insights = generateDynamicInsights();

  const handleAskQuick = (question: string) => {
    sounds.playClick();

    let reply = '';
    const q = question.toLowerCase();

    if (q.includes('sneaker') || q.includes('shopping')) {
      reply =
        metrics.safeDailyAllowance < 250
          ? `⛔ No way bestie. You have ₹${metrics.safeDailyAllowance}/day left. Buying kicks right now will force you into starvation mode for 10 days. Simulate it in the What-If Sandbox and see for yourself!`
          : `🤔 If it's under ₹1,200 and you sacrifice 3 outside cafe outings, you can swing it. Test it in the What-If simulator first!`;
    } else if (q.includes('goa') || q.includes('trip')) {
      reply = `🏖️ To hit your Goa Trip goal by Day 30, lock ₹200 from each weekend instead of spending it on club entry. You need ₹${Math.max(0, 2500 - metrics.totalSavingsLocked)} more to guarantee the beach vibe!`;
    } else if (q.includes('netflix') || q.includes('cancel')) {
      reply = `✂️ Pausing Netflix Mobile saves ₹149 instantly. Over your remaining days, that automatically boosts your safe daily allowance by ~₹10-15/day!`;
    } else {
      reply = `🧠 Financial Rule of Thumb: In a ₹10,000 monthly budget, keep Essentials ≤ ₹4,000, Fun ≤ ₹3,500, and Locked Savings ≥ ₹2,500. Your current Health Score is ${metrics.healthScore}/100.`;
    }

    setChatResponse(reply);
  };

  const approvalRate = Math.min(100, Math.round((metrics.safeDailyAllowance / 300) * 100));

  return (
    <ScrollReveal direction="up" distance={40} delay={0.15}>
      <div className="glass-panel-elevated rounded-3xl p-6 lg:p-8 border border-slate-800/80 relative overflow-hidden">
        {/* ambient glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl" />

        {/* Header */}
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={prefersReducedMotion ? {} : { rotate: [0, -6, 6, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20"
            >
              <Bot className="w-5 h-5 text-on-solid" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white">VibeCheck AI</h3>
                <span className="badge badge-purple">Rule Heuristic Engine</span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time Gen-Z financial analysis tailored to your ₹10,000 budget run.
              </p>
            </div>
          </div>

          {/* Persona Switcher Toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => {
                sounds.playClick();
                setPersonality('savage');
              }}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                personality === 'savage' ? 'text-rose-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {personality === 'savage' && (
                <motion.span
                  layoutId="persona-pill"
                  className="absolute inset-0 rounded-lg bg-rose-500/20 border border-rose-500/40"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Flame className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Savage Roaster</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setPersonality('gentle');
              }}
              className={`relative px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                personality === 'gentle' ? 'text-emerald-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {personality === 'gentle' && (
                <motion.span
                  layoutId="persona-pill"
                  className="absolute inset-0 rounded-lg bg-emerald-500/20 border border-emerald-500/40"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <HeartHandshake className="w-3.5 h-3.5 relative z-10" />
              <span className="relative z-10">Gentle Coach</span>
            </button>
          </div>
        </div>

        {/* Approval meter */}
        <div className="relative mb-6">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="font-semibold uppercase tracking-wider">VibeCheck Approval</span>
            <span className="font-mono font-bold text-slate-200">{approvalRate}%</span>
          </div>
          <div className="progress-bar">
            <motion.div
              className={`h-full rounded-full ${approvalRate >= 70 ? 'progress-bar-fill' : approvalRate >= 40 ? 'progress-bar-warning' : 'progress-bar-danger'}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${approvalRate}%` }}
              viewport={{ once: true }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Dynamic Advice Cards */}
        <motion.div
          key={personality}
          initial={prefersReducedMotion ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
        >
          {insights.map((item, idx) => (
            <motion.div
              key={`${personality}-${idx}`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className={`p-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${
                item.type === 'warning'
                  ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                  : item.type === 'praise'
                    ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/50'
              }`}
            >
              <div className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">{item.title}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Quick Prompts & Response */}
        <div className="relative bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            Ask VibeCheck Instant Advice:
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {[
              'Can I afford sneakers right now?',
              'How do I guarantee the Goa trip?',
              'Should I cut my Netflix subscription?',
              'What is the 50-30-20 rule for ₹10K?',
            ].map((q, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAskQuick(q)}
                className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-slate-300 hover:text-white text-xs transition-all"
              >
                "{q}"
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {chatResponse && (
              <motion.div
                key={chatResponse}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-200 leading-relaxed flex items-start gap-2.5"
              >
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white mb-0.5 font-bold">VibeCheck Verdict:</strong>
                  {chatResponse}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ScrollReveal>
  );
};
