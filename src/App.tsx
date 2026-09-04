/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ComponentItem, VisualFix, Stage, FixStatus } from './types';
import { INITIAL_COMPONENTS, INITIAL_VISUAL_FIXES } from './data/initialData';
import { normalizeStages, getStagesUpTo, hasStage } from './utils/stages';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { StageFunnel } from './components/StageFunnel';
import { ComponentList } from './components/ComponentList';
import { ComponentDetailModal } from './components/ComponentDetailModal';
import { VisualFixesManager } from './components/VisualFixesManager';
import { NewComponentModal } from './components/NewComponentModal';
import { NewFixModal } from './components/NewFixModal';

const STORAGE_KEY_COMPONENTS = 'ds_metrics_components_v1';
const STORAGE_KEY_FIXES = 'ds_metrics_fixes_v1';

export default function App() {
  // 1. Persistent State
  const [components, setComponents] = useState<ComponentItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPONENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading components from storage', e);
    }
    return INITIAL_COMPONENTS;
  });

  const [visualFixes, setVisualFixes] = useState<VisualFix[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FIXES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading fixes from storage', e);
    }
    return INITIAL_VISUAL_FIXES;
  });

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPONENTS, JSON.stringify(components));
    } catch (e) {
      console.error('Failed to save components to localStorage', e);
    }
  }, [components]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FIXES, JSON.stringify(visualFixes));
    } catch (e) {
      console.error('Failed to save fixes to localStorage', e);
    }
  }, [visualFixes]);

  // 2. Navigation & Selection State
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [activeComponent, setActiveComponent] = useState<ComponentItem | null>(null);
  const [isNewComponentOpen, setIsNewComponentOpen] = useState(false);
  const [isNewFixOpen, setIsNewFixOpen] = useState(false);
  const [isFixesManagerOpen, setIsFixesManagerOpen] = useState(false);

  // 3. Calculated Quick Metrics
  const totalFigma = components.length;
  const devAndDocCount = components.filter(
    c => hasStage(c.stages, 'react') && hasStage(c.stages, 'storybook')
  ).length;
  const documentedAndDevPct = totalFigma > 0 ? (devAndDocCount / totalFigma) * 100 : 0;

  const totalFixes = visualFixes.length;
  const pendingFixes = visualFixes.filter(f => f.status !== 'resuelto').length;

  // 4. Action Handlers
  const handleQuickPromote = (componentId: string, nextStage: Stage) => {
    setComponents(prev =>
      prev.map(c => {
        if (c.id !== componentId) return c;
        const newStages = getStagesUpTo(nextStage);
        return {
          ...c,
          stages: newStages,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      })
    );

    // Also update modal if currently viewing this component
    if (activeComponent && activeComponent.id === componentId) {
      setActiveComponent(prev => prev ? {
        ...prev,
        stages: getStagesUpTo(nextStage),
        lastUpdated: new Date().toISOString().split('T')[0],
      } : null);
    }
  };

  const handleUpdateComponentStages = (componentId: string, newStages: Stage[]) => {
    const normalized = normalizeStages(newStages);
    setComponents(prev =>
      prev.map(c => {
        if (c.id !== componentId) return c;
        return {
          ...c,
          stages: normalized,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      })
    );

    if (activeComponent && activeComponent.id === componentId) {
      setActiveComponent(prev => prev ? {
        ...prev,
        stages: normalized,
        lastUpdated: new Date().toISOString().split('T')[0],
      } : null);
    }
  };

  const handleAddFlow = (componentId: string, flowName: string) => {
    setComponents(prev =>
      prev.map(c => {
        if (c.id !== componentId) return c;
        if (c.flows.includes(flowName)) return c;
        const updatedFlows = [...c.flows, flowName];
        return { ...c, flows: updatedFlows };
      })
    );

    if (activeComponent && activeComponent.id === componentId) {
      setActiveComponent(prev => prev ? {
        ...prev,
        flows: prev.flows.includes(flowName) ? prev.flows : [...prev.flows, flowName],
      } : null);
    }
  };

  const handleRemoveFlow = (componentId: string, flowName: string) => {
    setComponents(prev =>
      prev.map(c => {
        if (c.id !== componentId) return c;
        return { ...c, flows: c.flows.filter(f => f !== flowName) };
      })
    );

    if (activeComponent && activeComponent.id === componentId) {
      setActiveComponent(prev => prev ? {
        ...prev,
        flows: prev.flows.filter(f => f !== flowName),
      } : null);
    }
  };

  const handleUpdateFixStatus = (fixId: string, newStatus: FixStatus) => {
    const now = new Date().toISOString().split('T')[0];
    setVisualFixes(prev =>
      prev.map(f => {
        if (f.id !== fixId) return f;
        return {
          ...f,
          status: newStatus,
          resolvedAt: newStatus === 'resuelto' ? now : undefined,
        };
      })
    );
  };

  const handleAddFix = (newFixData: Omit<VisualFix, 'id' | 'createdAt'>) => {
    const newFix: VisualFix = {
      ...newFixData,
      id: `fix-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setVisualFixes(prev => [newFix, ...prev]);
  };

  const handleAddComponent = (newCompData: Omit<ComponentItem, 'id' | 'lastUpdated'>) => {
    const newComp: ComponentItem = {
      ...newCompData,
      id: `comp-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setComponents(prev => [newComp, ...prev]);
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer todos los componentes y fixes a los datos iniciales de demostración?')) {
      setComponents(INITIAL_COMPONENTS);
      setVisualFixes(INITIAL_VISUAL_FIXES);
      localStorage.removeItem(STORAGE_KEY_COMPONENTS);
      localStorage.removeItem(STORAGE_KEY_FIXES);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onOpenNewComponent={() => setIsNewComponentOpen(true)}
        onOpenNewFix={() => setIsNewFixOpen(true)}
        onOpenFixesManager={() => setIsFixesManagerOpen(true)}
        onResetData={handleResetData}
        totalComponents={totalFigma}
        totalFixes={totalFixes}
        pendingFixes={pendingFixes}
        documentedAndDevPct={documentedAndDevPct}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metrics Overview (4 main requested metrics) */}
        <MetricsOverview
          components={components}
          visualFixes={visualFixes}
          onFilterByStatus={(status) => setSelectedStageFilter(status)}
          onOpenFixesManager={() => setIsFixesManagerOpen(true)}
        />

        {/* Sequential Pipeline Funnel */}
        <StageFunnel
          components={components}
          selectedStageFilter={selectedStageFilter}
          onSelectStage={(stage) => setSelectedStageFilter(stage)}
        />

        {/* Components Explorer & Filterable List */}
        <ComponentList
          components={components}
          visualFixes={visualFixes}
          selectedStageFilter={selectedStageFilter}
          onSelectStage={(stage) => setSelectedStageFilter(stage)}
          onSelectComponent={(component) => setActiveComponent(component)}
          onQuickPromote={handleQuickPromote}
          onOpenNewComponent={() => setIsNewComponentOpen(true)}
        />
      </main>

      {/* Bento Grid Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/80 px-4 sm:px-8 py-3.5 mt-8 text-[11px] text-slate-500 uppercase tracking-widest flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Environment: Production v4.2.0</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">Design System Metrics & Ops</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />Figma API: Connected</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />Pipeline: Nominal</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" />Storybook: Verified</span>
        </div>
      </footer>

      {/* Modals */}
      {activeComponent && (
        <ComponentDetailModal
          component={activeComponent}
          visualFixes={visualFixes}
          isOpen={!!activeComponent}
          onClose={() => setActiveComponent(null)}
          onUpdateComponentStages={handleUpdateComponentStages}
          onAddFlow={handleAddFlow}
          onRemoveFlow={handleRemoveFlow}
          onUpdateFixStatus={handleUpdateFixStatus}
          onAddFix={handleAddFix}
        />
      )}

      <VisualFixesManager
        isOpen={isFixesManagerOpen}
        onClose={() => setIsFixesManagerOpen(false)}
        visualFixes={visualFixes}
        components={components}
        onUpdateFixStatus={handleUpdateFixStatus}
        onOpenNewFix={() => {
          setIsFixesManagerOpen(false);
          setIsNewFixOpen(true);
        }}
      />

      <NewComponentModal
        isOpen={isNewComponentOpen}
        onClose={() => setIsNewComponentOpen(false)}
        onAddComponent={handleAddComponent}
      />

      <NewFixModal
        isOpen={isNewFixOpen}
        onClose={() => setIsNewFixOpen(false)}
        components={components}
        onAddFix={handleAddFix}
      />
    </div>
  );
}
