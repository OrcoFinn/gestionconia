import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Code2, 
  BookOpen, 
  Rocket, 
  Bug, 
  GitBranch, 
  ChevronRight, 
  CheckCircle2,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  Plus
} from 'lucide-react';
import { ComponentItem, Stage, VisualFix, FilterMode } from '../types';
import { STAGE_CONFIG, ORDERED_STAGES, hasStage, getHighestStage } from '../utils/stages';

interface ComponentListProps {
  components: ComponentItem[];
  visualFixes: VisualFix[];
  selectedStageFilter: string;
  onSelectStage: (stage: string) => void;
  onSelectComponent: (component: ComponentItem) => void;
  onQuickPromote: (componentId: string, nextStage: Stage) => void;
  onOpenNewComponent: () => void;
}

export const ComponentList: React.FC<ComponentListProps> = ({
  components,
  visualFixes,
  selectedStageFilter,
  onSelectStage,
  onSelectComponent,
  onQuickPromote,
  onOpenNewComponent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFlow, setSelectedFlow] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<FilterMode>('cumulative');
  const [onlyWithPendingFixes, setOnlyWithPendingFixes] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'stage' | 'flows' | 'fixes'>('stage');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(components.map(c => c.category));
    return Array.from(set).sort();
  }, [components]);

  // Unique flows list
  const allFlows = useMemo(() => {
    const set = new Set(components.flatMap(c => c.flows));
    return Array.from(set).sort();
  }, [components]);

  // Component fixes lookup
  const fixesByComponent = useMemo(() => {
    const map: Record<string, { total: number; resolved: number; pending: number }> = {};
    components.forEach(c => {
      map[c.id] = { total: 0, resolved: 0, pending: 0 };
    });
    visualFixes.forEach(fix => {
      if (!map[fix.componentId]) {
        map[fix.componentId] = { total: 0, resolved: 0, pending: 0 };
      }
      map[fix.componentId].total += 1;
      if (fix.status === 'resuelto') {
        map[fix.componentId].resolved += 1;
      } else {
        map[fix.componentId].pending += 1;
      }
    });
    return map;
  }, [components, visualFixes]);

  // Filtered components
  const filteredComponents = useMemo(() => {
    return components.filter(comp => {
      // 1. Stage filter
      if (selectedStageFilter !== 'all') {
        const stage = selectedStageFilter as Stage;
        if (filterMode === 'cumulative') {
          if (!hasStage(comp.stages, stage)) return false;
        } else {
          if (getHighestStage(comp.stages) !== stage) return false;
        }
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = comp.name.toLowerCase().includes(q);
        const matchesCat = comp.category.toLowerCase().includes(q);
        const matchesDesc = comp.description.toLowerCase().includes(q);
        const matchesFlow = comp.flows.some(f => f.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesDesc && !matchesFlow) {
          return false;
        }
      }

      // 3. Category filter
      if (selectedCategory !== 'all' && comp.category !== selectedCategory) {
        return false;
      }

      // 4. Flow filter
      if (selectedFlow !== 'all' && !comp.flows.includes(selectedFlow)) {
        return false;
      }

      // 5. Only with pending fixes
      if (onlyWithPendingFixes) {
        const fixInfo = fixesByComponent[comp.id];
        if (!fixInfo || fixInfo.pending === 0) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'stage') {
        comparison = a.stages.length - b.stages.length;
      } else if (sortBy === 'flows') {
        comparison = a.flows.length - b.flows.length;
      } else if (sortBy === 'fixes') {
        const aFixes = fixesByComponent[a.id]?.pending || 0;
        const bFixes = fixesByComponent[b.id]?.pending || 0;
        comparison = aFixes - bFixes;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [
    components, 
    selectedStageFilter, 
    filterMode, 
    searchQuery, 
    selectedCategory, 
    selectedFlow, 
    onlyWithPendingFixes,
    sortBy,
    sortOrder,
    fixesByComponent
  ]);

  const stageTabs = [
    { id: 'all', label: 'All Assets', count: components.length },
    { id: 'ui_library', label: 'UI Library', count: components.filter(c => hasStage(c.stages, 'ui_library')).length },
    { id: 'react', label: 'React', count: components.filter(c => hasStage(c.stages, 'react')).length },
    { id: 'storybook', label: 'StoryBook', count: components.filter(c => hasStage(c.stages, 'storybook')).length },
    { id: 'production', label: 'Production', count: components.filter(c => hasStage(c.stages, 'production')).length },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl text-slate-100">
      {/* Header Controls & Filter Tabs */}
      <div className="p-4 sm:p-5 border-b border-slate-800 space-y-4 bg-slate-900/60">
        {/* Stage Filter Tabs (Requested Primary Feature styled as Bento Grid buttons) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {stageTabs.map(tab => {
              const isActive = selectedStageFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`filter-stage-tab-${tab.id}`}
                  onClick={() => onSelectStage(tab.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Filter Mode Selector: Cumulative vs Exact */}
          {selectedStageFilter !== 'all' && (
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-500 text-[10px] uppercase font-bold px-1.5 hidden md:inline">Modo:</span>
              <button
                id="filter-mode-cumulative-btn"
                onClick={() => setFilterMode('cumulative')}
                title="Muestra componentes que tienen activo este estado (pueden tener estados posteriores)"
                className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition ${
                  filterMode === 'cumulative' 
                    ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Contiene el estado
              </button>
              <button
                id="filter-mode-exact-btn"
                onClick={() => setFilterMode('exact')}
                title="Muestra solo componentes cuya etapa más alta actual sea esta"
                className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition ${
                  filterMode === 'exact' 
                    ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Solo etapa actual
              </button>
            </div>
          )}
        </div>

        {/* Search and Secondary Filter Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="component-search-input"
              type="text"
              placeholder="Buscar por componente, categoría o flujo (ej. PrimaryButton, Checkout)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-950 text-slate-200 placeholder-slate-500 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300 px-1"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category select */}
            <select
              id="filter-category-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Categorías ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Flow select */}
            <select
              id="filter-flow-select"
              value={selectedFlow}
              onChange={e => setSelectedFlow(e.target.value)}
              className="px-2.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Flujos ({allFlows.length})</option>
              {allFlows.map(flow => (
                <option key={flow} value={flow}>{flow}</option>
              ))}
            </select>

            {/* Pending fixes toggle */}
            <button
              id="toggle-pending-fixes-btn"
              onClick={() => setOnlyWithPendingFixes(!onlyWithPendingFixes)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                onlyWithPendingFixes
                  ? 'bg-orange-500/20 border-orange-500/40 text-orange-300 font-semibold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-orange-400" />
              <span>Con fixes pendientes</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <select
                id="sort-by-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs py-1.5 px-2 text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="stage">Ordenar: Madurez</option>
                <option value="name">Ordenar: Nombre</option>
                <option value="flows">Ordenar: Flujos</option>
                <option value="fixes">Ordenar: Fixes</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-slate-400 hover:text-slate-200 rounded cursor-pointer"
                title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View switcher: Grid vs Table */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                id="view-table-btn"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded cursor-pointer transition ${
                  viewMode === 'table' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Vista en tabla Bento"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                id="view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded cursor-pointer transition ${
                  viewMode === 'grid' ? 'bg-slate-800 text-slate-100 shadow-xs' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Vista en tarjetas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active filters status summary */}
      <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>Mostrando <strong className="text-slate-200 font-mono">{filteredComponents.length}</strong> de {components.length} componentes</span>
          {(searchQuery || selectedCategory !== 'all' || selectedFlow !== 'all' || selectedStageFilter !== 'all' || onlyWithPendingFixes) && (
            <button
              id="clear-all-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedFlow('all');
                onSelectStage('all');
                setOnlyWithPendingFixes(false);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline cursor-pointer ml-1"
            >
              Restablecer filtros
            </button>
          )}
        </div>
        <div className="text-[11px] text-slate-500 italic">
          Haz clic en cualquier componente para gestionar etapas, flujos y fixes visuales.
        </div>
      </div>

      {/* Empty State */}
      {filteredComponents.length === 0 && (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-200 mb-1">
            No se encontraron componentes con estos filtros
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Prueba ajustando la búsqueda, seleccionando otra etapa o limpiando los filtros activos.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedFlow('all');
              onSelectStage('all');
              setOnlyWithPendingFixes(false);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/30 transition cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Bento Table View (Matches Design HTML) */}
      {viewMode === 'table' && filteredComponents.length > 0 && (
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/60 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Component Name</th>
                <th className="px-6 py-3.5 font-semibold">Implementation Pipeline</th>
                <th className="px-6 py-3.5 font-semibold">Usage</th>
                <th className="px-6 py-3.5 font-semibold">Visual Fixes</th>
                <th className="px-6 py-3.5 font-semibold text-right">Latest Ver.</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/50">
              {filteredComponents.map(comp => {
                const highest = getHighestStage(comp.stages);
                const fixInfo = fixesByComponent[comp.id] || { total: 0, resolved: 0, pending: 0 };
                const nextStageIndex = ORDERED_STAGES.indexOf(highest) + 1;
                const nextStage = nextStageIndex < ORDERED_STAGES.length ? ORDERED_STAGES[nextStageIndex] : null;

                const hasFigma = hasStage(comp.stages, 'ui_library');
                const hasReact = hasStage(comp.stages, 'react');
                const hasStorybook = hasStage(comp.stages, 'storybook');
                const hasProd = hasStage(comp.stages, 'production');

                return (
                  <tr
                    key={comp.id}
                    id={`table-row-${comp.id}`}
                    onClick={() => onSelectComponent(comp)}
                    className="hover:bg-slate-800/40 transition cursor-pointer group"
                  >
                    {/* Component Name & Category */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition">
                        {comp.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-xs flex items-center gap-1.5 mt-0.5">
                        <span className="text-slate-400 font-mono text-[11px]">{comp.category}</span>
                        <span>·</span>
                        <span className="truncate">{comp.description}</span>
                      </div>
                    </td>

                    {/* Implementation Pipeline (Bento signature 4 pill bars) */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-5 h-2 rounded transition-all ${hasFigma ? 'bg-indigo-500' : 'bg-slate-700'}`}
                          title="Figma (UI Library): Activo"
                        />
                        <span
                          className={`w-5 h-2 rounded transition-all ${hasReact ? 'bg-indigo-500' : 'bg-slate-700'}`}
                          title="React: Activo"
                        />
                        <span
                          className={`w-5 h-2 rounded transition-all ${hasStorybook ? 'bg-indigo-500' : 'bg-slate-700'}`}
                          title="Storybook: Activo"
                        />
                        <span
                          className={`w-5 h-2 rounded transition-all ${hasProd ? 'bg-emerald-500' : 'bg-slate-700'}`}
                          title="Producción: Activo"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        {STAGE_CONFIG[highest].label}
                      </div>
                    </td>

                    {/* Usage / Flows */}
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                      {comp.flows.length} flow{comp.flows.length !== 1 ? 's' : ''}
                      {comp.flows.length > 0 && (
                        <div className="text-[10px] text-slate-500 font-sans truncate max-w-[140px] mt-0.5">
                          {comp.flows.join(', ')}
                        </div>
                      )}
                    </td>

                    {/* Visual Fixes */}
                    <td className="px-6 py-4">
                      {fixInfo.total === 0 ? (
                        <span className="text-slate-600 font-mono text-xs">No Tasks</span>
                      ) : fixInfo.pending > 0 ? (
                        <span className="text-orange-400 font-mono text-xs font-semibold">
                          {fixInfo.pending} Open Task{fixInfo.pending !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-mono text-xs font-semibold">
                          Resolved
                        </span>
                      )}
                    </td>

                    {/* Latest Ver / Promote */}
                    <td className="px-6 py-4 text-right">
                      <div className="text-slate-500 font-mono text-xs mb-1">
                        v{comp.version}
                      </div>
                      {nextStage && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuickPromote(comp.id, nextStage);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition cursor-pointer"
                        >
                          + {STAGE_CONFIG[nextStage].shortLabel}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bento Grid Cards View */}
      {viewMode === 'grid' && filteredComponents.length > 0 && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map(comp => {
            const highest = getHighestStage(comp.stages);
            const fixInfo = fixesByComponent[comp.id] || { total: 0, resolved: 0, pending: 0 };
            const nextStageIndex = ORDERED_STAGES.indexOf(highest) + 1;
            const nextStage = nextStageIndex < ORDERED_STAGES.length ? ORDERED_STAGES[nextStageIndex] : null;

            return (
              <div
                key={comp.id}
                id={`component-card-${comp.id}`}
                onClick={() => onSelectComponent(comp)}
                className="group relative bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-lg hover:bg-slate-950 transition flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Bar: Name & Category */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-400 transition tracking-tight">
                        {comp.name}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500">
                        {comp.category} · v{comp.version}
                      </span>
                    </div>

                    <span 
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${STAGE_CONFIG[highest].badgeBg} ${STAGE_CONFIG[highest].borderColor}`}
                    >
                      {STAGE_CONFIG[highest].label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {comp.description}
                  </p>

                  {/* Stage Milestones Track */}
                  <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800/80 mb-3 space-y-1.5">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 flex justify-between">
                      <span>Pipeline de estados:</span>
                      <span className="text-slate-300 font-mono font-bold">
                        {comp.stages.length}/4
                      </span>
                    </div>

                    {/* Step pills */}
                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-medium">
                      {ORDERED_STAGES.map((stg) => {
                        const active = hasStage(comp.stages, stg);
                        return (
                          <div
                            key={stg}
                            title={`${STAGE_CONFIG[stg].label}: ${active ? 'Completado' : 'Pendiente'}`}
                            className={`py-1 rounded flex flex-col items-center gap-0.5 transition ${
                              active
                                ? `${STAGE_CONFIG[stg].badgeBg} font-semibold border ${STAGE_CONFIG[stg].borderColor}`
                                : 'bg-slate-950/80 text-slate-600 border border-slate-800'
                            }`}
                          >
                            <span className="truncate w-full px-0.5">
                              {active ? '✓ ' : ''}{STAGE_CONFIG[stg].shortLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flows Reuse Badges */}
                  <div className="mb-3">
                    <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <GitBranch className="w-3 h-3 text-indigo-400" />
                        Reutilizado en {comp.flows.length} flujos:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {comp.flows.slice(0, 3).map(flow => (
                        <span
                          key={flow}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-900 text-slate-300 border border-slate-800 font-medium"
                        >
                          {flow}
                        </span>
                      ))}
                      {comp.flows.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-semibold font-mono">
                          +{comp.flows.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer: Fixes Status & Quick action */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {/* Visual Fixes indicator */}
                  {fixInfo.total > 0 ? (
                    <div className="flex items-center gap-1">
                      {fixInfo.pending > 0 ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          <Bug className="w-3 h-3 text-orange-400" />
                          {fixInfo.pending} open
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Resolved
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-600 font-mono">No tasks</span>
                  )}

                  {/* Advance button or Details */}
                  {nextStage ? (
                    <button
                      id={`btn-quick-promote-${comp.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickPromote(comp.id, nextStage);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded-md border border-indigo-500/20 transition cursor-pointer"
                      title={`Avanzar a ${STAGE_CONFIG[nextStage].label}`}
                    >
                      <span>Avanzar a {STAGE_CONFIG[nextStage].shortLabel}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      En Producción
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
