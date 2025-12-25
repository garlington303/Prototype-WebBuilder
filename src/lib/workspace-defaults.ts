/**
 * Workspace Defaults
 * Default configurations and presets for workspaces
 */

import { 
  WorkspaceConfig, 
  PanelConfig, 
  Section, 
  ThemeConfig, 
  CanvasConfig,
  ComponentGroup,
  LayoutConfig
} from '@/types/workspace';

// ============================================
// DEFAULT COMPONENT PALETTE
// ============================================

export const DEFAULT_COMPONENT_GROUPS: ComponentGroup[] = [
  {
    id: 'layout',
    title: 'Layout',
    collapsed: false,
    components: [
      { id: 'comp_container', type: 'container', label: 'Container', icon: 'Box', description: 'Flexible container for grouping elements' },
      { id: 'comp_card', type: 'card', label: 'Card', icon: 'Square', description: 'Content card with header and body' },
    ],
  },
  {
    id: 'elements',
    title: 'Elements',
    collapsed: false,
    components: [
      { id: 'comp_button', type: 'button', label: 'Button', icon: 'MousePointer', description: 'Interactive button element' },
      { id: 'comp_header', type: 'header', label: 'Heading', icon: 'Type', description: 'Heading text (H1-H4)' },
      { id: 'comp_text', type: 'text', label: 'Text Block', icon: 'AlignLeft', description: 'Paragraph text block' },
      { id: 'comp_input', type: 'input', label: 'Input Field', icon: 'FormInput', description: 'Form input field' },
    ],
  },
];

// ============================================
// DEFAULT SECTIONS
// ============================================

export const DEFAULT_LEFT_SIDEBAR_SECTIONS: Section[] = [
  {
    id: 'section_add',
    title: 'Add',
    icon: 'Plus',
    order: 0,
    collapsed: false,
    visible: true,
    editable: true,
    deletable: false,
    type: 'component-palette',
    content: {
      componentGroups: DEFAULT_COMPONENT_GROUPS,
    },
  },
  {
    id: 'section_layers',
    title: 'Layers',
    icon: 'Layers',
    order: 1,
    collapsed: false,
    visible: true,
    editable: true,
    deletable: false,
    type: 'layer-tree',
  },
];

export const DEFAULT_RIGHT_SIDEBAR_SECTIONS: Section[] = [
  {
    id: 'section_properties',
    title: 'Properties',
    icon: 'Settings',
    order: 0,
    collapsed: false,
    visible: true,
    editable: true,
    deletable: false,
    type: 'properties',
  },
  {
    id: 'section_ai',
    title: 'AI Assistant',
    icon: 'Sparkles',
    order: 1,
    collapsed: true,
    visible: true,
    editable: true,
    deletable: true,
    type: 'ai-prompt',
  },
];

// ============================================
// DEFAULT PANEL CONFIGS
// ============================================

export const DEFAULT_LEFT_SIDEBAR: PanelConfig = {
  id: 'panel_left',
  visible: true,
  width: 280,
  minWidth: 200,
  maxWidth: 400,
  position: 'left',
  resizable: true,
  collapsible: true,
  collapsed: false,
  sections: DEFAULT_LEFT_SIDEBAR_SECTIONS,
};

export const DEFAULT_RIGHT_SIDEBAR: PanelConfig = {
  id: 'panel_right',
  visible: true,
  width: 320,
  minWidth: 280,
  maxWidth: 500,
  position: 'right',
  resizable: true,
  collapsible: true,
  collapsed: false,
  sections: DEFAULT_RIGHT_SIDEBAR_SECTIONS,
};

export const DEFAULT_HEADER: PanelConfig = {
  id: 'panel_header',
  visible: true,
  height: 56,
  minHeight: 48,
  maxHeight: 80,
  position: 'top',
  resizable: false,
  collapsible: false,
  collapsed: false,
  sections: [],
};

export const DEFAULT_FOOTER: PanelConfig = {
  id: 'panel_footer',
  visible: false,
  height: 32,
  minHeight: 24,
  maxHeight: 48,
  position: 'bottom',
  resizable: false,
  collapsible: true,
  collapsed: true,
  sections: [],
};

// ============================================
// DEFAULT CANVAS CONFIG
// ============================================

export const DEFAULT_CANVAS: CanvasConfig = {
  gridSize: 20,
  snapToGrid: false,
  showGrid: true,
  backgroundColor: 'transparent',
  minZoom: 0.25,
  maxZoom: 2,
  defaultZoom: 1,
};

// ============================================
// DEFAULT THEME
// ============================================

export const DEFAULT_DARK_THEME: ThemeConfig = {
  mode: 'dark',
  primaryColor: '#3b82f6',   // Blue 500
  accentColor: '#10b981',    // Emerald 500
  backgroundColor: '#0a0a0b',
  surfaceColor: '#18181b',
  textColor: '#fafafa',
  mutedColor: '#71717a',
  borderColor: '#27272a',
  borderRadius: 8,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 14,
};

export const DEFAULT_LIGHT_THEME: ThemeConfig = {
  mode: 'light',
  primaryColor: '#3b82f6',
  accentColor: '#10b981',
  backgroundColor: '#ffffff',
  surfaceColor: '#f4f4f5',
  textColor: '#18181b',
  mutedColor: '#71717a',
  borderColor: '#e4e4e7',
  borderRadius: 8,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 14,
};

// ============================================
// DEFAULT LAYOUT
// ============================================

export const DEFAULT_LAYOUT: LayoutConfig = {
  panels: {
    leftSidebar: DEFAULT_LEFT_SIDEBAR,
    rightSidebar: DEFAULT_RIGHT_SIDEBAR,
    header: DEFAULT_HEADER,
    footer: DEFAULT_FOOTER,
  },
  canvas: DEFAULT_CANVAS,
};

// ============================================
// DEFAULT WORKSPACE
// ============================================

export const createDefaultWorkspace = (id?: string): WorkspaceConfig => ({
  id: id || 'default',
  name: 'Default Workspace',
  description: 'Standard builder workspace with all panels',
  version: '1.0.0',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  layout: DEFAULT_LAYOUT,
  theme: DEFAULT_DARK_THEME,
  isDefault: true,
  isPreset: false,
});

// ============================================
// WORKSPACE PRESETS
// ============================================

export const WORKSPACE_PRESETS: Record<string, () => WorkspaceConfig> = {
  minimal: () => ({
    id: 'preset_minimal',
    name: 'Minimal',
    description: 'Clean canvas with minimal UI',
    version: '1.0.0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    layout: {
      panels: {
        leftSidebar: {
          ...DEFAULT_LEFT_SIDEBAR,
          width: 240,
          collapsed: true,
        },
        rightSidebar: {
          ...DEFAULT_RIGHT_SIDEBAR,
          visible: false,
        },
        header: DEFAULT_HEADER,
        footer: DEFAULT_FOOTER,
      },
      canvas: DEFAULT_CANVAS,
    },
    theme: DEFAULT_DARK_THEME,
    isDefault: false,
    isPreset: true,
  }),

  designer: () => ({
    id: 'preset_designer',
    name: 'Designer',
    description: 'Full-featured design workspace',
    version: '1.0.0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    layout: {
      panels: {
        leftSidebar: {
          ...DEFAULT_LEFT_SIDEBAR,
          width: 300,
        },
        rightSidebar: {
          ...DEFAULT_RIGHT_SIDEBAR,
          width: 360,
        },
        header: DEFAULT_HEADER,
        footer: DEFAULT_FOOTER,
      },
      canvas: {
        ...DEFAULT_CANVAS,
        gridSize: 8,
        snapToGrid: true,
      },
    },
    theme: DEFAULT_DARK_THEME,
    isDefault: false,
    isPreset: true,
  }),

  developer: () => ({
    id: 'preset_developer',
    name: 'Developer',
    description: 'Code-focused workspace with properties panel',
    version: '1.0.0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    layout: {
      panels: {
        leftSidebar: {
          ...DEFAULT_LEFT_SIDEBAR,
          width: 260,
          sections: [
            {
              ...DEFAULT_LEFT_SIDEBAR_SECTIONS[1], // Layers only
              order: 0,
            },
          ],
        },
        rightSidebar: {
          ...DEFAULT_RIGHT_SIDEBAR,
          width: 400,
        },
        header: DEFAULT_HEADER,
        footer: {
          ...DEFAULT_FOOTER,
          visible: true,
          collapsed: false,
        },
      },
      canvas: DEFAULT_CANVAS,
    },
    theme: DEFAULT_DARK_THEME,
    isDefault: false,
    isPreset: true,
  }),

  mobile: () => ({
    id: 'preset_mobile',
    name: 'Mobile Preview',
    description: 'Optimized for mobile prototyping',
    version: '1.0.0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    layout: {
      panels: {
        leftSidebar: {
          ...DEFAULT_LEFT_SIDEBAR,
          collapsed: true,
        },
        rightSidebar: {
          ...DEFAULT_RIGHT_SIDEBAR,
          collapsed: true,
        },
        header: DEFAULT_HEADER,
        footer: DEFAULT_FOOTER,
      },
      canvas: {
        ...DEFAULT_CANVAS,
        gridSize: 4,
      },
    },
    theme: DEFAULT_DARK_THEME,
    isDefault: false,
    isPreset: true,
  }),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getPresetNames(): string[] {
  return Object.keys(WORKSPACE_PRESETS);
}

export function getPreset(name: string): WorkspaceConfig | null {
  const presetFn = WORKSPACE_PRESETS[name];
  return presetFn ? presetFn() : null;
}

export function mergeWithDefaults(partial: Partial<WorkspaceConfig>): WorkspaceConfig {
  const defaults = createDefaultWorkspace();
  return {
    ...defaults,
    ...partial,
    layout: {
      ...defaults.layout,
      ...partial.layout,
      panels: {
        ...defaults.layout.panels,
        ...partial.layout?.panels,
      },
      canvas: {
        ...defaults.layout.canvas,
        ...partial.layout?.canvas,
      },
    },
    theme: {
      ...defaults.theme,
      ...partial.theme,
    },
  };
}
