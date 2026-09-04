import React from 'react';
import { 
  CheckCircle2, 
  Bug, 
  GitBranch, 
  Layers, 
  Sparkles,
  BookOpen,
  Code2,
  Rocket,
  ArrowUpRight
} from 'lucide-react';
import { ComponentItem, VisualFix } from '../types';
import { hasStage } from '../utils/stages';

interface MetricsOverviewProps {
  components: ComponentItem[];
  visualFixes: VisualFix[];
  onFilterByStatus?: (status: string) => void;
  onOpenFixesManager?: () => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  components,
  visualFixes,
  onFilterByStatus,
  onOpenFixesManager,
}) => {
  const totalFigma = components.length;

  // 1. Desarrollados (React) and Documentados (StoryBook)
  const inReact = components.filter(c => hasStage(c.stages, 'react')).length;
  const inStoryBook = components.filter(c => hasStage(c.stages, 'storybook')).length;
  const inProduction = components.filter(c => hasStage(c.stages, 'production')).length;
  const developedAndDocumented = components.filter(
    c => hasStage(c.stages, 'react') && hasStage(c.stages, 'storybook')
  ).length;

  const pctDevelopedAndDocumented = totalFigma > 0 ? (developedAndDocumented / totalFigma) * 100 : 0;
  const pctReact = totalFigma > 0 ? (inReact / totalFigma) * 100 : 0;
  const pctStoryBook = totalFigma > 0 ? (inStoryBook / totalFigma) * 100 : 0;
  const pctProduction = totalFigma > 0 ? (inProduction / totalFigma) * 100 : 0;

  // 2. Tareas creadas por Diseño para fixes visuales
  const totalFixes = visualFixes.length;
  const resolvedFixes = visualFixes.filter(f => f.status === 'resuelto').length;
  const inProgressFixes = visualFixes.filter(f => f.status === 'en_progreso').length;
  const pendingOnlyFixes = visualFixes.filter(f => f.status === 'pendiente').length;
  const pendingFixes = inProgressFixes + pendingOnlyFixes;

  // 4. Porcentaje de fixes resueltos vs pendientes
  const pctResolvedFixes = totalFixes > 0 ? (resolvedFixes / totalFixes) * 100 : 0;
  const pctPendingFixes = totalFixes > 0 ? (pendingFixes / totalFixes) * 100 : 0;

  // 3. Reutilización en flujos
  const componentsInMultipleFlows = components.filter(c => c.flows.length >= 2).length;
  const totalFlowAdoptions = components.reduce((acc, c) => acc + c.flows.length, 0);
  const avgFlowsPerComponent = totalFigma > 0 ? (totalFlowAdoptions / totalFigma).toFixed(1) : '0';

  // Top Flows
  const flowFrequency: Record<string, number> = {};
  components.forEach(c => {
    c.flows.forEach(flow => {
      flowFrequency[flow] = (flowFrequency[flow] || 0) + 1;
    });
  });
  const topFlows = Object.entries(flowFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const criticalFixes = visualFixes.filter(f => f.severity === 'critica' && f.status !== 'resuelto').length;
  const highFixes = visualFixes.filter(f => f.severity === 'alta' && f.status !== 'resuelto').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Bento 1: Library Coverage */}
      <div 
        id="metric-card-coverage"
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-slate-700 transition"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">
              Library Coverage
            </p>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="text-4xl font-bold text-indigo-400 tracking-tight">
              {pctDevelopedAndDocumented.toFixed(1)}%
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              ({developedAndDocumented}/{totalFigma})
            </span>
          </div>

          {/* Main Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
            <div 
              className="bg-indigo-500 h-full transition-all duration-500" 
              style={{ width: `${pctDevelopedAndDocumented}%` }}
            />
          </div>

          <p className="text-xs text-slate-400 mb-3">
            {developedAndDocumented} de {totalFigma} componentes Figma en React y documentados en StoryBook.
          </p>
        </div>

        {/* Breakdown bars */}
        <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 text-sky-400">
              <Code2 className="w-3 h-3" /> React
            </span>
            <span className="text-slate-200 font-semibold">{inReact} ({pctReact.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-sky-400 h-full" style={{ width: `${pctReact}%` }} />
          </div>

          <div className="flex justify-between text-slate-400 text-[11px] pt-1">
            <span className="flex items-center gap-1 text-purple-400">
              <BookOpen className="w-3 h-3" /> StoryBook
            </span>
            <span className="text-slate-200 font-semibold">{inStoryBook} ({pctStoryBook.toFixed(0)}%)</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
            <div className="bg-purple-400 h-full" style={{ width: `${pctStoryBook}%` }} />
          </div>
        </div>
      </div>

      {/* Bento 2: Visual Fixes */}
      <div 
        id="metric-card-fixes-count"
        onClick={onOpenFixesManager}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-slate-700 transition cursor-pointer group"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">
              Visual Fixes
            </p>
            <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:bg-orange-500/20 transition">
              <Bug className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="text-4xl font-bold text-orange-400 tracking-tight">
              {pctResolvedFixes.toFixed(0)}%
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              resueltos ({totalFixes} tareas)
            </span>
          </div>

          {/* Pending vs Resolved Status */}
          <div className="flex items-center gap-2 mb-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
            <span className="text-orange-400 font-bold text-xs">{pendingFixes} Pendientes</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-bold text-xs">{resolvedFixes} Resueltos</span>
          </div>

          <p className="text-xs text-slate-400">
            Ciclo de revisión de tokens y discrepancias Figma vs FrontEnd.
          </p>
        </div>

        {/* Split progress bar */}
        <div className="space-y-2 pt-3 border-t border-slate-800/80">
          <div className="w-full bg-slate-800 rounded-full h-2 flex overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${pctResolvedFixes}%` }}
            />
            <div 
              className="bg-orange-400 h-full transition-all duration-500" 
              style={{ width: `${pctPendingFixes}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Atención urgente:</span>
            <span className="font-semibold text-rose-400">
              {criticalFixes} crítico · {highFixes} alto
            </span>
          </div>
        </div>
      </div>

      {/* Bento 3: Avg. Component Reuse */}
      <div 
        id="metric-card-flows-reuse"
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl hover:border-slate-700 transition"
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-slate-500 text-xs uppercase tracking-wider font-bold">
              Avg. Component Reuse
            </p>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <GitBranch className="w-4 h-4" />
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <h2 className="text-4xl font-bold text-emerald-400 tracking-tight">
              {avgFlowsPerComponent}x
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              ({componentsInMultipleFlows} en 2+ flujos)
            </span>
          </div>

          {/* Reuse rhythm equalizer bars */}
          <div className="flex items-end gap-1.5 h-6 mb-3">
            <div className="h-3 w-1.5 bg-emerald-500/30 rounded-full"></div>
            <div className="h-4 w-1.5 bg-emerald-500/50 rounded-full"></div>
            <div className="h-5 w-1.5 bg-emerald-500/70 rounded-full"></div>
            <div className="h-6 w-1.5 bg-emerald-500 rounded-full"></div>
            <div className="h-4 w-1.5 bg-emerald-500/80 rounded-full"></div>
            <div className="h-5 w-1.5 bg-emerald-500/60 rounded-full"></div>
            <span className="text-[11px] text-slate-400 ml-1">
              {totalFlowAdoptions} adopciones activas
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-2">
            Alta eficiencia en Checkout, Dashboard y Configuración.
          </p>
        </div>

        {/* Top flows chips */}
        <div className="space-y-1 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap gap-1">
            {topFlows.map(([flow, count]) => (
              <span
                key={flow}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/90 text-slate-300 border border-slate-700/80"
              >
                {flow} <span className="text-emerald-400 font-bold">{count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bento 4: Design-to-Code Action Tile (Theme signature) */}
      <div 
        id="metric-card-handover"
        className="bg-indigo-600 rounded-2xl p-5 flex flex-col justify-between shadow-2xl shadow-indigo-500/20 text-white relative overflow-hidden"
      >
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✨</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white border border-white/30">
              Ops Ready
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Design-to-Code
          </h3>
          <p className="text-indigo-100 text-xs mb-3">
            {inReact - inProduction} componentes en etapa activa de handover para release a Producción.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-indigo-100 bg-indigo-700/60 p-2 rounded-xl border border-indigo-500/40">
            <span>En Producción:</span>
            <span className="font-bold text-white text-sm">{inProduction}/{totalFigma}</span>
          </div>

          <button
            onClick={onOpenFixesManager}
            className="w-full bg-white hover:bg-slate-100 text-indigo-700 text-xs font-bold py-2 px-3 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Ver Fixes de Diseño</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
