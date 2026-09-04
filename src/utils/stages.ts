import { Stage } from '../types';

export const ORDERED_STAGES: Stage[] = ['ui_library', 'react', 'storybook', 'production'];

export const STAGE_CONFIG: Record<Stage, {
  label: string;
  shortLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  accentColor: string;
}> = {
  ui_library: {
    label: 'Librería UI',
    shortLabel: 'Figma',
    description: 'Componente diseñado y tokenizado en Figma por UX/UI',
    badgeBg: 'bg-indigo-950/70 text-indigo-400 border border-indigo-500/30',
    badgeText: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    accentColor: '#6366f1',
  },
  react: {
    label: 'React',
    shortLabel: 'React',
    description: 'Implementado en React con TypeScript y estilos modulares',
    badgeBg: 'bg-sky-950/70 text-sky-400 border border-sky-500/30',
    badgeText: 'text-sky-400',
    borderColor: 'border-sky-500/30',
    accentColor: '#38bdf8',
  },
  storybook: {
    label: 'StoryBook',
    shortLabel: 'StoryBook',
    description: 'Documentado con stories interactivas y controles de props',
    badgeBg: 'bg-purple-950/70 text-purple-400 border border-purple-500/30',
    badgeText: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    accentColor: '#c084fc',
  },
  production: {
    label: 'Producción',
    shortLabel: 'Producción',
    description: 'Consumido activamente en aplicaciones en producción',
    badgeBg: 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/30',
    badgeText: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    accentColor: '#34d399',
  },
};

/**
 * Ensures strict stage hierarchy:
 * 1. ui_library is always present for any component in the system.
 * 2. If react is active, ui_library must be active.
 * 3. If storybook is active, react & ui_library must be active.
 * 4. If production is active, all previous (ui_library, react, storybook) MUST be active.
 */
export function normalizeStages(stages: Stage[]): Stage[] {
  const set = new Set<Stage>(stages);

  // If in production -> all 4 must be present
  if (set.has('production')) {
    return ['ui_library', 'react', 'storybook', 'production'];
  }

  // If in storybook -> requires react and ui_library
  if (set.has('storybook')) {
    return ['ui_library', 'react', 'storybook'];
  }

  // If in react -> requires ui_library
  if (set.has('react')) {
    return ['ui_library', 'react'];
  }

  // Base stage
  return ['ui_library'];
}

/**
 * Returns stages when advancing to a milestone
 */
export function getStagesUpTo(targetStage: Stage): Stage[] {
  const targetIndex = ORDERED_STAGES.indexOf(targetStage);
  if (targetIndex === -1) return ['ui_library'];
  return ORDERED_STAGES.slice(0, targetIndex + 1);
}

export function getHighestStage(stages: Stage[]): Stage {
  for (let i = ORDERED_STAGES.length - 1; i >= 0; i--) {
    if (stages.includes(ORDERED_STAGES[i])) {
      return ORDERED_STAGES[i];
    }
  }
  return 'ui_library';
}

export function hasStage(stages: Stage[], stage: Stage): boolean {
  return stages.includes(stage);
}
