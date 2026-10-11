import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Header } from './components/layout/Header';
import { NavBar } from './components/layout/NavBar';
import { CustomCursor } from './components/ui/CustomCursor';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

// Lazy-loaded pages
const OverviewPage = lazy(() => import('./pages/OverviewPage').then(m => ({ default: m.OverviewPage })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const BudgetPlannerPage = lazy(() => import('./pages/BudgetPlannerPage').then(m => ({ default: m.BudgetPlannerPage })));
const CommitmentsPage = lazy(() => import('./pages/CommitmentsPage').then(m => ({ default: m.CommitmentsPage })));
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const SavingsPage = lazy(() => import('./pages/SavingsPage').then(m => ({ default: m.SavingsPage })));
const UnexpectedExpensesPage = lazy(() => import('./pages/UnexpectedExpensesPage').then(m => ({ default: m.UnexpectedExpensesPage })));
const SimulatorPage = lazy(() => import('./pages/SimulatorPage').then(m => ({ default: m.SimulatorPage })));
const HealthPage = lazy(() => import('./pages/HealthPage').then(m => ({ default: m.HealthPage })));

// Modals
const LifeEventModal = lazy(() =>
  import('./components/features/LifeEventModal').then((m) => ({ default: m.LifeEventModal }))
);
const ExportModal = lazy(() =>
  import('./components/features/ExportModal').then((m) => ({ default: m.ExportModal }))
);

function Layout() {
  const [isLifeEventOpen, setIsLifeEventOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const {
    currentDay,
    setCurrentDay,
    soundEnabled,
    setSoundEnabled,
    handleResetData,
    handleLoadScenario,
    handleApplyLifeEvent,
    liquidBalance,
    metrics,
    transactions,
    savingsGoals,
  } = useFinancial();

  return (
    <div className="relative isolate min-h-screen text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      <CustomCursor />

      {/* Ambient background layers */}
      <div className="ambient-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-emerald-600/10 blur-[130px]" />
        <div className="absolute top-1/3 -right-40 w-[32rem] h-[32rem] rounded-full bg-cyan-600/10 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/3 w-[30rem] h-[30rem] rounded-full bg-purple-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(16,185,129,0.08),transparent_55%)]" />
      </div>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-emerald-500 focus:text-slate-950 focus:font-bold focus:text-sm"
      >
        Skip to main content
      </a>

      {/* Top Application Header */}
      <Header
        currentDay={currentDay}
        onSetDay={setCurrentDay}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
        onOpenLifeEvent={() => setIsLifeEventOpen(true)}
        onResetData={handleResetData}
        onLoadScenario={handleLoadScenario}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Primary route navigation */}
      <NavBar />

      {/* Main Body */}
      <main id="main" tabIndex={-1} className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 focus:outline-none">
        <AnimatePresence mode="wait">
          <Suspense fallback={<div className="h-20 flex items-center justify-center text-slate-500">Loading…</div>}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Navigate to="/overview" replace />} />
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/budget" element={<BudgetPlannerPage />} />
                <Route path="/commitments" element={<CommitmentsPage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/savings" element={<SavingsPage />} />
                <Route path="/unexpected" element={<UnexpectedExpensesPage />} />
                <Route path="/simulator" element={<SimulatorPage />} />
                <Route path="/health" element={<HealthPage />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative w-full border-t border-slate-800/70 bg-slate-950/70 backdrop-blur-xl py-6 px-4 sm:px-6 lg:px-8 mt-12 text-center text-xs text-slate-500 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Kuber<span className="text-emerald-400">Z</span> Financial Engine</span>
            <span className="text-slate-600">•</span>
            <span>Built for PROMPT RUN 2026 Hackathon</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Automated Evaluation Ready • React 19 + TypeScript + Tailwind</span>
          </div>
        </div>
      </footer>

      {/* Modals (code-split, mounted on demand) */}
      <Suspense fallback={null}>
        {isLifeEventOpen && (
          <LifeEventModal
            isOpen={isLifeEventOpen}
            onClose={() => setIsLifeEventOpen(false)}
            onApplyEvent={handleApplyLifeEvent}
            currentDay={currentDay}
          />
        )}

        {isExportOpen && (
          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            currentDay={currentDay}
            liquidBalance={liquidBalance}
            metrics={metrics}
            transactions={transactions}
            savingsGoals={savingsGoals}
          />
        )}
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <FinancialProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </FinancialProvider>
  );
}

export default App;