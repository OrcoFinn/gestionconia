export type Stage = 'ui_library' | 'react' | 'storybook' | 'production';

export type FixSeverity = 'baja' | 'media' | 'alta' | 'critica';
export type FixStatus = 'pendiente' | 'en_progreso' | 'resuelto';

export interface VisualFix {
  id: string;
  componentId: string;
  componentName?: string;
  title: string;
  description: string;
  severity: FixSeverity;
  status: FixStatus;
  reporter: string; // e.g., 'Lucía (UI Lead)', 'Mateo (UX Designer)'
  assignedTo?: string; // e.g., 'Martín (FrontEnd)'
  createdAt: string;
  resolvedAt?: string;
  figmaFrameUrl?: string;
}

export interface ComponentItem {
  id: string;
  name: string;
  category: 'Acciones' | 'Formularios' | 'Feedback' | 'Navegación' | 'Layout' | 'Datos' | 'Superficies';
  description: string;
  stages: Stage[]; // In strict hierarchical order: ui_library -> react -> storybook -> production
  flows: string[]; // E.g. ['Checkout', 'Onboarding', 'Dashboard']
  figmaNodeId?: string;
  storybookPath?: string;
  repoPath?: string;
  version: string;
  lastUpdated: string;
}

export type FilterMode = 'exact' | 'cumulative';
