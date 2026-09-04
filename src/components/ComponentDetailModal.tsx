import React, { useState } from 'react';
import { 
  X, 
  Figma, 
  Code2, 
  BookOpen, 
  Rocket, 
  CheckCircle2, 
  Clock, 
  Plus, 
  GitBranch, 
  Bug, 
  Info, 
  ShieldCheck, 
  User
} from 'lucide-react';
import { ComponentItem, Stage, VisualFix, FixSeverity, FixStatus } from '../types';
import { STAGE_CONFIG, ORDERED_STAGES, hasStage, getStagesUpTo, getHighestStage } from '../utils/stages';

interface ComponentDetailModalProps {
  component: ComponentItem;
  visualFixes: VisualFix[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateComponentStages: (componentId: string, newStages: Stage[]) => void;
  onAddFlow: (componentId: string, flowName: string) => void;
  onRemoveFlow: (componentId: string, flowName: string) => void;
  onUpdateFixStatus: (fixId: string, newStatus: FixStatus) => void;
  onAddFix: (fix: Omit<VisualFix, 'id' | 'createdAt'>) => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  visualFixes,
  isOpen,
  onClose,
  onUpdateComponentStages,
  onAddFlow,
  onRemoveFlow,
  onUpdateFixStatus,
  onAddFix,
}) => {
  const [newFlowInput, setNewFlowInput] = useState('');
  const [showAddFixForm, setShowAddFixForm] = useState(false);
  const [fixTitle, setFixTitle] = useState('');
  const [fixDesc, setFixDesc] = useState('');
  const [fixSeverity, setFixSeverity] = useState<FixSeverity>('media');
  const [fixReporter, setFixReporter] = useState('Equipo UX/UI');
  const [figmaFrameUrl, setFigmaFrameUrl] = useState('');

  if (!isOpen) return null;

  const componentFixes = visualFixes.filter(f => f.componentId === component.id);
  const highestStage = getHighestStage(component.stages);

  const handleStageSelect = (targetStage: Stage) => {
    const newStages = getStagesUpTo(targetStage);
    onUpdateComponentStages(component.id, newStages);
  };

  const handleAddFlowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFlowInput.trim() && !component.flows.includes(newFlowInput.trim())) {
      onAddFlow(component.id, newFlowInput.trim());
      setNewFlowInput('');
    }
  };

  const handleCreateFixSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixTitle.trim()) return;

    onAddFix({
      componentId: component.id,
      componentName: component.name,
      title: fixTitle.trim(),
      description: fixDesc.trim() || 'Ajuste visual solicitado por el equipo de diseño.',
      severity: fixSeverity,
      status: 'pendiente',
      reporter: fixReporter.trim() || 'Diseño UX/UI',
      figmaFrameUrl: figmaFrameUrl.trim() || undefined,
    });

    setFixTitle('');
    setFixDesc('');
    setFixSeverity('media');
    setFigmaFrameUrl('');
    setShowAddFixForm(false);
  };

  const commonFlowSuggestions = [
    'Checkout', 'Onboarding', 'Dashboard', 'Configuración', 'Transacciones', 'Autenticación', 'Notificaciones', 'Catálogo'
  ].filter(f => !component.flows.includes(f));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-6 transition-all text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {component.name}
              </h2>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {component.category}
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v{component.version}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              {component.description}
            </p>
          </div>

          <button
            id="close-component-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: STAGE PROGRESSION (Enforcing strict state order) */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Gestión de Pipeline Jerárquico</span>
              </h3>
              <span className="text-xs font-mono font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                Etapa Máxima: {STAGE_CONFIG[highestStage].label}
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Selecciona el hito alcanzado. Si activas <strong>Producción</strong>, el sistema garantiza automáticamente la activación de Librería UI, React y StoryBook.
            </p>

            {/* Stepper buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ORDERED_STAGES.map((stg, idx) => {
                const isActive = hasStage(component.stages, stg);
                const Icon = stg === 'ui_library' ? Figma : stg === 'react' ? Code2 : stg === 'storybook' ? BookOpen : Rocket;

                return (
                  <button
                    key={stg}
                    id={`modal-stage-btn-${stg}`}
                    onClick={() => handleStageSelect(stg)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? `${STAGE_CONFIG[stg].badgeBg} ring-1 ring-current/20 shadow-md`
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-mono font-bold">
                        {isActive ? '✓ ACTIVO' : `PASO ${idx + 1}`}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight text-slate-100">
                        {STAGE_CONFIG[stg].label}
                      </div>
                      <div className="text-[10px] opacity-75 truncate text-slate-400">
                        {stg === 'ui_library' && 'Figma tokens'}
                        {stg === 'react' && 'Código React'}
                        {stg === 'storybook' && 'Stories docs'}
                        {stg === 'production' && 'Desplegado'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanatory note */}
            <div className="mt-3 text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Regla de transición:</strong> Si está en <em>React</em>, contiene <em>Librería UI</em>. Si alcanza <em>Producción</em>, debe contener todos los anteriores.
              </span>
            </div>
          </div>

          {/* SECTION 2: FLOW REUSE */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <GitBranch className="w-4 h-4 text-emerald-400" />
                <span>Reutilización en Flujos de Producto ({component.flows.length})</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Pantallas y módulos de la aplicación donde este componente está implementado.
            </p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {component.flows.map(flow => (
                <span
                  key={flow}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                >
                  <span>{flow}</span>
                  <button
                    onClick={() => onRemoveFlow(component.id, flow)}
                    className="text-slate-400 hover:text-rose-400 rounded cursor-pointer"
                    title={`Eliminar de ${flow}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {component.flows.length === 0 && (
                <span className="text-xs text-slate-500 italic">No asignado a flujos aún.</span>
              )}
            </div>

            {/* Add flow form */}
            <form onSubmit={handleAddFlowSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Escribir nuevo flujo (ej. Onboarding, Checkout)..."
                value={newFlowInput}
                onChange={e => setNewFlowInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newFlowInput.trim()}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition cursor-pointer"
              >
                + Agregar
              </button>
            </form>

            {/* Suggestions */}
            {commonFlowSuggestions.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
                <span>Sugerencias rápidas:</span>
                {commonFlowSuggestions.slice(0, 4).map(sugg => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => onAddFlow(component.id, sugg)}
                    className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 cursor-pointer transition"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: DESIGN VISUAL FIXES */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Bug className="w-4 h-4 text-orange-400" />
                <span>Fixes Visuales Reportados por UX/UI ({componentFixes.length})</span>
              </h3>

              <button
                id="btn-toggle-add-fix"
                onClick={() => setShowAddFixForm(!showAddFixForm)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddFixForm ? 'Cancelar' : 'Reportar Fix Visual'}</span>
              </button>
            </div>

            {/* Add Fix Form */}
            {showAddFixForm && (
              <form onSubmit={handleCreateFixSubmit} className="mb-4 p-3 bg-slate-900 border border-orange-500/30 rounded-xl space-y-2.5">
                <div className="text-xs font-bold text-orange-300">
                  Nuevo ticket de observación visual de Diseño:
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Título del fix (ej. Padding lateral desfasado en mobile)..."
                    value={fixTitle}
                    onChange={e => setFixTitle(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Descripción del desajuste visual con respecto a Figma..."
                    value={fixDesc}
                    onChange={e => setFixDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">Severidad:</label>
                    <select
                      value={fixSeverity}
                      onChange={e => setFixSeverity(e.target.value as FixSeverity)}
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs"
                    >
                      <option value="baja">Baja (Micro-detalle)</option>
                      <option value="media">Media (Espaciado/Color)</option>
                      <option value="alta">Alta (Token erróneo/WCAG)</option>
                      <option value="critica">Crítica (Roto visualmente)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">Reportado por:</label>
                    <input
                      type="text"
                      value={fixReporter}
                      onChange={e => setFixReporter(e.target.value)}
                      placeholder="Nombre del diseñador..."
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-0.5">URL Frame Figma (opcional):</label>
                    <input
                      type="text"
                      value={figmaFrameUrl}
                      onChange={e => setFigmaFrameUrl(e.target.value)}
                      placeholder="https://figma.com/..."
                      className="w-full px-2 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddFixForm(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition"
                  >
                    Guardar Fix Visual
                  </button>
                </div>
              </form>
            )}

            {/* Fixes List */}
            <div className="space-y-2">
              {componentFixes.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2 text-center bg-slate-900 rounded-lg">
                  No hay fixes visuales reportados para este componente.
                </div>
              ) : (
                componentFixes.map(fix => {
                  const isResolved = fix.status === 'resuelto';

                  return (
                    <div
                      key={fix.id}
                      className={`p-3 rounded-lg border text-xs transition ${
                        isResolved
                          ? 'bg-slate-900/60 border-slate-800 opacity-70'
                          : 'bg-slate-900 border-orange-500/30 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
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

                          <span className="font-semibold text-slate-100">
                            {fix.title}
                          </span>
                        </div>

                        {/* Status switcher */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => onUpdateFixStatus(
                              fix.id, 
                              isResolved ? 'pendiente' : 'resuelto'
                            )}
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition cursor-pointer ${
                              isResolved
                                ? 'bg-emerald-500/20 text-emerald-300 hover:bg-orange-500/20 hover:text-orange-300'
                                : 'bg-orange-500/20 text-orange-300 hover:bg-emerald-500/20 hover:text-emerald-300'
                            }`}
                            title={isResolved ? 'Reabrir fix' : 'Marcar como resuelto'}
                          >
                            {isResolved ? '✓ Resuelto' : 'Marcar Resuelto'}
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-400 mb-2">
                        {fix.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1 font-sans">
                          <User className="w-3 h-3" />
                          <span>Reportado por: {fix.reporter}</span>
                        </span>
                        <span>{fix.createdAt}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SECTION 4: REPOSITORY & DOC LINKS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-500 block mb-1">Nodo Figma:</span>
              <span className="font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                {component.figmaNodeId || 'figma-comp:001'}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-500 block mb-1">StoryBook Path:</span>
              <span className="font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 truncate block">
                {component.storybookPath || 'stories/components'}
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-500 block mb-1">Código FrontEnd:</span>
              <span className="font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 truncate block">
                {component.repoPath || 'src/components'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">
            Última sync: {component.lastUpdated}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
