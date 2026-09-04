import React from 'react';
import { 
  Figma, 
  Code2, 
  BookOpen, 
  Rocket, 
  ArrowRight
} from 'lucide-react';
import { ComponentItem, Stage } from '../types';
import { hasStage } from '../utils/stages';

interface StageFunnelProps {
  components: ComponentItem[];
  selectedStageFilter: string;
  onSelectStage: (stage: string) => void;
}

export const StageFunnel: React.FC<StageFunnelProps> = ({
  components,
  selectedStageFilter,
  onSelectStage,
}) => {
  const total = components.length;
  const inFigma = total;
  const inReact = components.filter(c => hasStage(c.stages, 'react')).length;
  const inStoryBook = components.filter(c => hasStage(c.stages, 'storybook')).length;
  const inProduction = components.filter(c => hasStage(c.stages, 'production')).length;

  const steps = [
    {
      id: 'ui_library',
      title: 'Librería UI',
      sub: 'Tokens Figma',
      count: inFigma,
      pct: 100,
      icon: Figma,
      barColor: 'bg-indigo-500',
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border border-indigo-500/20',
    },
    {
      id: 'react',
      title: 'React',
      sub: 'FrontEnd Dev',
      count: inReact,
      pct: total > 0 ? (inReact / total) * 100 : 0,
      icon: Code2,
      barColor: 'bg-sky-400',
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border border-sky-500/20',
    },
    {
      id: 'storybook',
      title: 'StoryBook',
      sub: 'Documentado',
      count: inStoryBook,
      pct: total > 0 ? (inStoryBook / total) * 100 : 0,
      icon: BookOpen,
      barColor: 'bg-purple-400',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border border-purple-500/20',
    },
    {
      id: 'production',
      title: 'Producción',
      sub: 'Desplegado en Apps',
      count: inProduction,
      pct: total > 0 ? (inProduction / total) * 100 : 0,
      icon: Rocket,
      barColor: 'bg-emerald-400',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            Pipeline de Madurez del Componente
            <span className="text-xs font-normal text-slate-500 hidden sm:inline">
              // Secuencia jerárquica estricta
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Regla de sistema: Producción requiere verificación previa en Figma, React y StoryBook.
          </p>
        </div>

        {selectedStageFilter !== 'all' && (
          <button
            id="clear-funnel-filter-btn"
            onClick={() => onSelectStage('all')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline self-start sm:self-auto cursor-pointer"
          >
            Quitar filtro de etapa
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isSelected = selectedStageFilter === step.id;
          const isLast = idx === steps.length - 1;

          return (
            <div
              key={step.id}
              id={`stage-funnel-card-${step.id}`}
              onClick={() => onSelectStage(isSelected ? 'all' : step.id)}
              className={`relative rounded-xl border p-4 transition cursor-pointer text-left ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/30 shadow-md'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950/80'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${step.iconBg}`}>
                    <Icon className={`w-4 h-4 ${step.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100 leading-tight">
                      {step.title}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {step.sub}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/80 border border-slate-700/80 px-2 py-0.5 rounded-full">
                  {step.count}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Adopción</span>
                  <span className="font-semibold text-slate-300">{step.pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${step.barColor}`}
                    style={{ width: `${step.pct}%` }}
                  />
                </div>
              </div>

              {/* Step indicator arrow for desktop */}
              {!isLast && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-900 rounded-full p-1 border border-slate-800 shadow-md pointer-events-none">
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
