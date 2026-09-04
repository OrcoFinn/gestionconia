import React, { useState } from 'react';
import { X, Bug } from 'lucide-react';
import { ComponentItem, VisualFix, FixSeverity } from '../types';

interface NewFixModalProps {
  isOpen: boolean;
  onClose: () => void;
  components: ComponentItem[];
  onAddFix: (fix: Omit<VisualFix, 'id' | 'createdAt'>) => void;
}

export const NewFixModal: React.FC<NewFixModalProps> = ({
  isOpen,
  onClose,
  components,
  onAddFix,
}) => {
  const [componentId, setComponentId] = useState(components[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<FixSeverity>('media');
  const [reporter, setReporter] = useState('Equipo UX/UI');
  const [assignedTo, setAssignedTo] = useState('Equipo FrontEnd');
  const [figmaFrameUrl, setFigmaFrameUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !componentId) return;

    const selectedComp = components.find(c => c.id === componentId);

    onAddFix({
      componentId,
      componentName: selectedComp?.name || 'Componente',
      title: title.trim(),
      description: description.trim() || 'Ajuste visual reportado desde el review de diseño.',
      severity,
      status: 'pendiente',
      reporter: reporter.trim() || 'Diseño UX/UI',
      assignedTo: assignedTo.trim() || 'FrontEnd',
      figmaFrameUrl: figmaFrameUrl.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setSeverity('media');
    setFigmaFrameUrl('');
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
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Bug className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Reportar Fix Visual (UX/UI Review)
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
              Componente afectado *
            </label>
            <select
              value={componentId}
              onChange={e => setComponentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500"
            >
              {components.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Título del problema visual *
            </label>
            <input
              type="text"
              required
              placeholder="ej. Padding inconsistente en mobile, color de hover desalineado"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Descripción de la discrepancia
            </label>
            <textarea
              rows={2}
              placeholder="Indica las diferencias detectadas respecto al componente de Figma..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Nivel de severidad
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as FixSeverity)}
                className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500"
              >
                <option value="baja">Baja (Micro-detalle visual)</option>
                <option value="media">Media (Espaciado, tipografía o color)</option>
                <option value="alta">Alta (Token erróneo o contraste WCAG)</option>
                <option value="critica">Crítica (Roto visualmente en pantalla)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Reportado por
              </label>
              <input
                type="text"
                placeholder="Nombre del diseñador"
                value={reporter}
                onChange={e => setReporter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Asignado a
              </label>
              <input
                type="text"
                placeholder="FrontEnd dev asignado"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                URL Frame Figma (opcional)
              </label>
              <input
                type="text"
                placeholder="https://figma.com/..."
                value={figmaFrameUrl}
                onChange={e => setFigmaFrameUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
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
              className="px-4 py-2 font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-md transition cursor-pointer"
            >
              Crear Tarea de Fix
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
