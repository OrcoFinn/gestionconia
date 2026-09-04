import React from 'react';
import { Plus, Bug } from 'lucide-react';

interface NavbarProps {
  onOpenNewComponent: () => void;
  onOpenNewFix: () => void;
  onOpenFixesManager?: () => void;
  onResetData?: () => void;
  totalComponents?: number;
  totalFixes?: number;
  pendingFixes?: number;
  documentedAndDevPct?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewComponent,
  onOpenNewFix,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <span className="text-xs font-black tracking-wider">DS</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white truncate">
                  SystemSync <span className="text-slate-500 font-normal">// UX/UI Ops</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Figma ➔ React ➔ Storybook
                </span>
              </div>
            </div>
          </div>

          {/* Actions: Solo Nuevo Fix y Nuevo Componente */}
          <div className="flex items-center gap-2.5">
            <button
              id="nav-new-fix-btn"
              onClick={onOpenNewFix}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg transition shadow-xs cursor-pointer"
              title="Reportar fix visual de UX/UI"
            >
              <Bug className="w-3.5 h-3.5 text-orange-400" />
              <span>Nuevo Fix</span>
            </button>

            <button
              id="nav-new-component-btn"
              onClick={onOpenNewComponent}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition shadow-lg shadow-indigo-500/20 cursor-pointer"
              title="Registrar nuevo componente"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Componente</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
