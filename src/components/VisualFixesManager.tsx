import React, { useState } from 'react';
import { 
  X, 
  Bug, 
  CheckCircle2, 
  Plus, 
  User
} from 'lucide-react';
import { VisualFix, FixStatus, ComponentItem } from '../types';

interface VisualFixesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  visualFixes: VisualFix[];
  components: ComponentItem[];
  onUpdateFixStatus: (fixId: string, newStatus: FixStatus) => void;
  onOpenNewFix: () => void;
}

export const VisualFixesManager: React.FC<VisualFixesManagerProps> = ({
  isOpen,
  onClose,
  visualFixes,
  components,
  onUpdateFixStatus,
  onOpenNewFix,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendiente' | 'resuelto'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [componentFilter, setComponentFilter] = useState<string>('all');

  if (!isOpen) return null;

  const total = visualFixes.length;
  const resolved = visualFixes.filter(f => f.status === 'resuelto').length;
  const pending = total - resolved;
  const pctResolved = total > 0 ? (resolved / total) * 100 : 0;
  const pctPending = total > 0 ? (pending / total) * 100 : 0;

  const filteredFixes = visualFixes.filter(fix => {
    if (statusFilter === 'pendiente' && fix.status === 'resuelto') return false;
    if (statusFilter === 'resuelto' && fix.status !== 'resuelto') return false;
    if (severityFilter !== 'all' && fix.severity !== severityFilter) return false;
    if (componentFilter !== 'all' && fix.componentId !== componentFilter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden my-6 transition-all text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Bug className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Fixes Visuales de Diseño UX/UI
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Seguimiento de tareas de revisión visual y resolución de deuda en FrontEnd.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewFix}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Fix</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metrics Banner (Bento tiles in modal) */}
        <div className="p-4 sm:p-5 bg-slate-950/50 border-b border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center mb-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-mono font-medium text-slate-500 block uppercase">Total Tareas</span>
              <span className="text-2xl font-bold text-slate-100 font-mono">{total}</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-mono font-medium text-emerald-500 block uppercase">Resueltos</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">{resolved}</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-mono font-medium text-orange-500 block uppercase">Pendientes</span>
              <span className="text-2xl font-bold text-orange-400 font-mono">{pending}</span>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-mono font-medium text-indigo-400 block uppercase">% Resueltos</span>
              <span className="text-xl font-bold text-indigo-300 font-mono">
                {pctResolved.toFixed(0)}% <span className="text-xs text-slate-500 font-normal">/ {pctPending.toFixed(0)}%</span>
              </span>
            </div>
          </div>

          {/* Progress bar split */}
          <div className="w-full bg-slate-800 rounded-full h-2 flex overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${pctResolved}%` }}
              title={`Resueltos: ${resolved} (${pctResolved.toFixed(1)}%)`}
            />
            <div 
              className="bg-orange-400 h-full transition-all duration-500" 
              style={{ width: `${pctPending}%` }}
              title={`Pendientes: ${pending} (${pctPending.toFixed(1)}%)`}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Estado:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                statusFilter === 'all' ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({total})
            </button>
            <button
              onClick={() => setStatusFilter('pendiente')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                statusFilter === 'pendiente' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pendientes ({pending})
            </button>
            <button
              onClick={() => setStatusFilter('resuelto')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                statusFilter === 'resuelto' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resueltos ({resolved})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todas las severidades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>

            <select
              value={componentFilter}
              onChange={e => setComponentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs max-w-[180px] focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos los componentes</option>
              {components.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Fixes List */}
        <div className="p-4 sm:p-5 max-h-[55vh] overflow-y-auto space-y-3">
          {filteredFixes.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-300">No hay tareas que coincidan con estos filtros</p>
            </div>
          ) : (
            filteredFixes.map(fix => {
              const isResolved = fix.status === 'resuelto';

              return (
                <div
                  key={fix.id}
                  className={`p-4 rounded-xl border transition ${
                    isResolved
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-70'
                      : 'bg-slate-950/80 border-orange-500/30 shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                          fix.severity === 'critica'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : fix.severity === 'alta'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : fix.severity === 'media'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {fix.severity}
                        </span>

                        <span className="font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded text-xs">
                          {fix.componentName}
                        </span>

                        <span className="font-bold text-slate-100 text-sm">
                          {fix.title}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">
                        {fix.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-start">
                      <button
                        onClick={() => onUpdateFixStatus(
                          fix.id,
                          isResolved ? 'pendiente' : 'resuelto'
                        )}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isResolved
                            ? 'bg-emerald-500/20 hover:bg-orange-500/20 text-emerald-300 hover:text-orange-300 border border-emerald-500/30'
                            : 'bg-orange-500 hover:bg-emerald-600 text-white shadow-md'
                        }`}
                      >
                        {isResolved ? '✓ Resuelto (Reabrir)' : 'Resolver Fix'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-3 font-sans">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Por: {fix.reporter}</span>
                      </span>
                      {fix.assignedTo && (
                        <span>➔ Asignado: {fix.assignedTo}</span>
                      )}
                    </div>
                    <span>{fix.createdAt}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
