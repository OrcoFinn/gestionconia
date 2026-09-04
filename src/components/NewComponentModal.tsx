import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { ComponentItem, Stage } from '../types';
import { ORDERED_STAGES, STAGE_CONFIG, getStagesUpTo } from '../utils/stages';

interface NewComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (comp: Omit<ComponentItem, 'id' | 'lastUpdated'>) => void;
}

export const NewComponentModal: React.FC<NewComponentModalProps> = ({
  isOpen,
  onClose,
  onAddComponent,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ComponentItem['category']>('Formularios');
  const [description, setDescription] = useState('');
  const [targetStage, setTargetStage] = useState<Stage>('ui_library');
  const [flowsInput, setFlowsInput] = useState('');
  const [figmaNodeId, setFigmaNodeId] = useState('');
  const [version, setVersion] = useState('1.0.0');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Ordered stages up to selected stage
    const stages = getStagesUpTo(targetStage);

    // Split flows by commas
    const flows = flowsInput
      .split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    onAddComponent({
      name: name.trim(),
      category,
      description: description.trim() || 'Nuevo componente registrado en la librería de diseño.',
      stages,
      flows: flows.length > 0 ? flows : ['Dashboard'],
      figmaNodeId: figmaNodeId.trim() || `figma-${Date.now().toString().slice(-4)}`,
      version: version.trim() || '1.0.0',
    });

    // Reset and close
    setName('');
    setDescription('');
    setFlowsInput('');
    setFigmaNodeId('');
    setTargetStage('ui_library');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transition-all text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Registrar Nuevo Componente
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Nombre del componente *
            </label>
            <input
              type="text"
              required
              placeholder="ej. SegmentedControl, Autocomplete, Toast"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Formularios">Formularios</option>
                <option value="Acciones">Acciones</option>
                <option value="Feedback">Feedback</option>
                <option value="Navegación">Navegación</option>
                <option value="Layout">Layout</option>
                <option value="Datos">Datos</option>
                <option value="Superficies">Superficies</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Versión inicial
              </label>
              <input
                type="text"
                placeholder="1.0.0"
                value={version}
                onChange={e => setVersion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Descripción funcional
            </label>
            <textarea
              rows={2}
              placeholder="Propósito del componente, casos de uso principales..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Initial Stage */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Etapa inicial alcanzada (pipeline secuencial):
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {ORDERED_STAGES.map(stg => (
                <button
                  type="button"
                  key={stg}
                  onClick={() => setTargetStage(stg)}
                  className={`p-2 rounded-lg border text-center font-medium cursor-pointer transition ${
                    targetStage === stg
                      ? `${STAGE_CONFIG[stg].badgeBg} font-bold ring-1 ring-current/30`
                      : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-mono">{STAGE_CONFIG[stg].shortLabel}</div>
                </button>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Activa automáticamente todas las etapas previas requeridas por orden jerárquico.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Flujos donde se reutiliza (separados por coma)
            </label>
            <input
              type="text"
              placeholder="ej. Checkout, Onboarding, Dashboard"
              value={flowsInput}
              onChange={e => setFlowsInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition cursor-pointer"
            >
              Guardar Componente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
