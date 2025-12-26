import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// COMPONENT TYPE DEFINITIONS
// ============================================

// RetroDiffusion-specific components
export type RetroDiffusionComponentType =
  | 'RD_HEADER'
  | 'RD_MODEL_SELECTOR'
  | 'RD_ART_STYLE_SELECTOR'
  | 'RD_PROMPT_EDITOR'
  | 'RD_IMAGE_CANVAS'
  | 'RD_HISTORY_PANEL'
  | 'RD_GENERATE_BUTTON'
  | 'RD_IMAGE_COUNT'
  | 'RD_REFERENCE_IMAGES'
  | 'RD_FOOTER';

// Generic Layout Components
export type LayoutContainerType =
  | 'CONTAINER'
  | 'FLEX_ROW'
  | 'FLEX_COL'
  | 'GRID_2'
  | 'GRID_3'
  | 'GRID_4'
  | 'SECTION'
  | 'DIV'
  | 'CARD'
  | 'PANEL'
  | 'ACCORDION'
  | 'TABS';

// Typography Components
export type TypographyType =
  | 'HEADING_1'
  | 'HEADING_2'
  | 'HEADING_3'
  | 'HEADING_4'
  | 'PARAGRAPH'
  | 'TEXT_SPAN'
  | 'LABEL'
  | 'LINK'
  | 'BLOCKQUOTE'
  | 'CODE_BLOCK';

// Form Elements
export type FormElementType =
  | 'INPUT_TEXT'
  | 'INPUT_EMAIL'
  | 'INPUT_PASSWORD'
  | 'INPUT_NUMBER'
  | 'TEXTAREA'
  | 'SELECT'
  | 'CHECKBOX'
  | 'RADIO'
  | 'SWITCH'
  | 'SLIDER'
  | 'BUTTON'
  | 'BUTTON_GROUP'
  | 'FORM';

// Media Components
export type MediaType =
  | 'IMAGE'
  | 'ICON'
  | 'AVATAR'
  | 'VIDEO_EMBED'
  | 'PLACEHOLDER_IMAGE';

// Navigation Components
export type NavigationType =
  | 'NAVBAR'
  | 'SIDEBAR_NAV'
  | 'BREADCRUMBS'
  | 'TABS_NAV'
  | 'MENU'
  | 'DROPDOWN';

// Data Display Components
export type DataDisplayType =
  | 'BADGE'
  | 'TAG'
  | 'STAT_CARD'
  | 'PROGRESS_BAR'
  | 'LIST'
  | 'LIST_ITEM'
  | 'TABLE'
  | 'DIVIDER'
  | 'SPACER';

// Feedback Components
export type FeedbackType =
  | 'ALERT'
  | 'TOAST'
  | 'TOOLTIP'
  | 'MODAL'
  | 'LOADING_SPINNER';

// All component types combined
export type ComponentType =
  | RetroDiffusionComponentType
  | LayoutContainerType
  | TypographyType
  | FormElementType
  | MediaType
  | NavigationType
  | DataDisplayType
  | FeedbackType;

// Component category for toolbox organization
export type ComponentCategory =
  | 'retrodiffusion'
  | 'layout'
  | 'typography'
  | 'form'
  | 'media'
  | 'navigation'
  | 'data'
  | 'feedback';

export interface LayoutComponent {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  size: { width: number | 'auto'; height: number | 'auto' };
  zIndex: number;
  visible: boolean;
  locked: boolean;
  props: Record<string, unknown>;
  parentId: string | null; // For nested components
  children?: string[]; // Child component IDs for containers
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  components: LayoutComponent[];
  createdAt: number;
  updatedAt: number;
}

// ============================================
// DEFAULT LAYOUT (3-Panel RetroDiffusion)
// ============================================

const DEFAULT_LAYOUT: LayoutComponent[] = [
  {
    id: 'header-1',
    type: 'RD_HEADER',
    position: { x: 0, y: 0 },
    size: { width: 'auto', height: 56 },
    zIndex: 100,
    visible: true,
    locked: true,
    props: {},
    parentId: null,
  },
  {
    id: 'model-selector-1',
    type: 'RD_MODEL_SELECTOR',
    position: { x: 0, y: 56 },
    size: { width: 340, height: 'auto' },
    zIndex: 10,
    visible: true,
    locked: false,
    props: { section: 'sidebar-left' },
    parentId: null,
  },
  {
    id: 'art-style-1',
    type: 'RD_ART_STYLE_SELECTOR',
    position: { x: 0, y: 200 },
    size: { width: 340, height: 'auto' },
    zIndex: 10,
    visible: true,
    locked: false,
    props: { section: 'sidebar-left', expanded: true },
    parentId: null,
  },
  {
    id: 'prompt-1',
    type: 'RD_PROMPT_EDITOR',
    position: { x: 0, y: 400 },
    size: { width: 340, height: 'auto' },
    zIndex: 10,
    visible: true,
    locked: false,
    props: { section: 'sidebar-left' },
    parentId: null,
  },
  {
    id: 'ref-images-1',
    type: 'RD_REFERENCE_IMAGES',
    position: { x: 0, y: 520 },
    size: { width: 340, height: 'auto' },
    zIndex: 10,
    visible: true,
    locked: false,
    props: { section: 'sidebar-left', expanded: false },
    parentId: null,
  },
  {
    id: 'image-count-1',
    type: 'RD_IMAGE_COUNT',
    position: { x: 0, y: 580 },
    size: { width: 340, height: 'auto' },
    zIndex: 10,
    visible: true,
    locked: false,
    props: { section: 'sidebar-left' },
    parentId: null,
  },
  {
    id: 'generate-1',
    type: 'RD_GENERATE_BUTTON',
    position: { x: 0, y: 640 },
    size: { width: 340, height: 56 },
    zIndex: 10,
    visible: true,
    locked: false,
    props: { section: 'sidebar-left' },
    parentId: null,
  },
  {
    id: 'canvas-1',
    type: 'RD_IMAGE_CANVAS',
    position: { x: 340, y: 56 },
    size: { width: 'auto', height: 'auto' },
    zIndex: 5,
    visible: true,
    locked: false,
    props: { section: 'main' },
    parentId: null,
  },
  {
    id: 'history-1',
    type: 'RD_HISTORY_PANEL',
    position: { x: -280, y: 56 },
    size: { width: 280, height: 'auto' },
    zIndex: 10,
    visible: true,
    locked: false,
    props: { section: 'sidebar-right' },
    parentId: null,
  },
  {
    id: 'footer-1',
    type: 'RD_FOOTER',
    position: { x: 0, y: -40 },
    size: { width: 'auto', height: 40 },
    zIndex: 100,
    visible: true,
    locked: true,
    props: {},
    parentId: null,
  },
];

// ============================================
// LAYOUT STORE
// ============================================

interface LayoutState {
  // Current layout
  components: LayoutComponent[];
  selectedComponentId: string | null;
  isEditMode: boolean;
  
  // Presets
  presets: LayoutPreset[];
  activePresetId: string | null;
  
  // Actions - Component Management
  addComponent: (component: Omit<LayoutComponent, 'id'>) => string;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<LayoutComponent>) => void;
  moveComponent: (id: string, position: { x: number; y: number }) => void;
  resizeComponent: (id: string, size: { width: number | 'auto'; height: number | 'auto' }) => void;
  setComponentVisibility: (id: string, visible: boolean) => void;
  
  // Actions - Selection
  selectComponent: (id: string | null) => void;
  
  // Actions - Edit Mode
  setEditMode: (enabled: boolean) => void;
  
  // Actions - Layout Management
  resetToDefault: () => void;
  loadLayout: (components: LayoutComponent[]) => void;
  
  // Actions - Presets
  saveAsPreset: (name: string, description?: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  
  // Getters
  getComponentById: (id: string) => LayoutComponent | undefined;
  getComponentsByType: (type: RetroDiffusionComponentType) => LayoutComponent[];
  getComponentsBySection: (section: string) => LayoutComponent[];
}

const generateId = () => `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      // Initial state
      components: DEFAULT_LAYOUT,
      selectedComponentId: null,
      isEditMode: false,
      presets: [],
      activePresetId: null,

      // Component Management
      addComponent: (component) => {
        const id = generateId();
        set((state) => ({
          components: [...state.components, { ...component, id }],
        }));
        return id;
      },

      removeComponent: (id) => {
        set((state) => ({
          components: state.components.filter((c) => c.id !== id),
          selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
        }));
      },

      updateComponent: (id, updates) => {
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      moveComponent: (id, position) => {
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, position } : c
          ),
        }));
      },

      resizeComponent: (id, size) => {
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, size } : c
          ),
        }));
      },

      setComponentVisibility: (id, visible) => {
        set((state) => ({
          components: state.components.map((c) =>
            c.id === id ? { ...c, visible } : c
          ),
        }));
      },

      // Selection
      selectComponent: (id) => {
        set({ selectedComponentId: id });
      },

      // Edit Mode
      setEditMode: (enabled) => {
        set({ isEditMode: enabled });
      },

      // Layout Management
      resetToDefault: () => {
        // Clear persisted storage
        try {
          localStorage.removeItem('rd-layout-storage');
        } catch (e) {
          console.warn('Failed to clear layout storage', e);
        }
        set({
          components: DEFAULT_LAYOUT,
          selectedComponentId: null,
          activePresetId: null,
        });
      },

      loadLayout: (components) => {
        set({
          components,
          selectedComponentId: null,
        });
      },

      // Presets
      saveAsPreset: (name, description = '') => {
        const preset: LayoutPreset = {
          id: generateId(),
          name,
          description,
          components: get().components,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          presets: [...state.presets, preset],
          activePresetId: preset.id,
        }));
      },

      loadPreset: (presetId) => {
        const preset = get().presets.find((p) => p.id === presetId);
        if (preset) {
          set({
            components: preset.components,
            activePresetId: presetId,
            selectedComponentId: null,
          });
        }
      },

      deletePreset: (presetId) => {
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== presetId),
          activePresetId: state.activePresetId === presetId ? null : state.activePresetId,
        }));
      },

      // Getters
      getComponentById: (id) => {
        return get().components.find((c) => c.id === id);
      },

      getComponentsByType: (type) => {
        return get().components.filter((c) => c.type === type);
      },

      getComponentsBySection: (section) => {
        return get().components.filter((c) => c.props.section === section);
      },
    }),
    {
      name: 'rd-layout-storage',
      partialize: (state) => ({
        components: state.components,
        presets: state.presets,
        activePresetId: state.activePresetId,
      }),
    }
  )
);

// ============================================
// COMPONENT INFO (for builder sidebar)
// ============================================

export interface ComponentInfo {
  name: string;
  description: string;
  icon: string;
  category: ComponentCategory;
  defaultSize: { width: number | 'auto'; height: number | 'auto' };
  allowedSections: string[];
  defaultProps?: Record<string, unknown>;
  isContainer?: boolean;
}

export const COMPONENT_CATALOG: Record<ComponentType, ComponentInfo> = {
  // ============================================
  // RETRODIFFUSION COMPONENTS
  // ============================================
  RD_HEADER: {
    name: 'Header',
    description: 'Navigation header with logo',
    icon: '🔝',
    category: 'retrodiffusion',
    defaultSize: { width: 'auto', height: 56 },
    allowedSections: ['header'],
  },
  RD_MODEL_SELECTOR: {
    name: 'Model Selector',
    description: 'RD Fast/Plus/Pro model picker',
    icon: '🤖',
    category: 'retrodiffusion',
    defaultSize: { width: 340, height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
  },
  RD_ART_STYLE_SELECTOR: {
    name: 'Art Style Selector',
    description: 'Grid of art style presets',
    icon: '🎨',
    category: 'retrodiffusion',
    defaultSize: { width: 340, height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
  },
  RD_PROMPT_EDITOR: {
    name: 'Prompt Editor',
    description: 'Text input for prompts',
    icon: '✍️',
    category: 'retrodiffusion',
    defaultSize: { width: 340, height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
  },
  RD_IMAGE_CANVAS: {
    name: 'Image Canvas',
    description: 'Main generation preview area',
    icon: '🖼️',
    category: 'retrodiffusion',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
  },
  RD_HISTORY_PANEL: {
    name: 'History Panel',
    description: 'Generated images history',
    icon: '📜',
    category: 'retrodiffusion',
    defaultSize: { width: 280, height: 'auto' },
    allowedSections: ['sidebar-right', 'sidebar-left'],
  },
  RD_GENERATE_BUTTON: {
    name: 'Generate Button',
    description: 'Main action button',
    icon: '⚡',
    category: 'retrodiffusion',
    defaultSize: { width: 340, height: 56 },
    allowedSections: ['sidebar-left', 'footer'],
  },
  RD_IMAGE_COUNT: {
    name: 'Image Count',
    description: 'Number of images selector',
    icon: '🔢',
    category: 'retrodiffusion',
    defaultSize: { width: 340, height: 'auto' },
    allowedSections: ['sidebar-left'],
  },
  RD_REFERENCE_IMAGES: {
    name: 'Reference Images',
    description: 'Image upload for references',
    icon: '📷',
    category: 'retrodiffusion',
    defaultSize: { width: 340, height: 'auto' },
    allowedSections: ['sidebar-left'],
  },
  RD_FOOTER: {
    name: 'Footer',
    description: 'Bottom footer with links',
    icon: '🔻',
    category: 'retrodiffusion',
    defaultSize: { width: 'auto', height: 40 },
    allowedSections: ['footer'],
  },

  // ============================================
  // LAYOUT CONTAINERS
  // ============================================
  CONTAINER: {
    name: 'Container',
    description: 'Basic container with padding',
    icon: '📦',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    isContainer: true,
    defaultProps: { className: 'p-4' },
  },
  FLEX_ROW: {
    name: 'Flex Row',
    description: 'Horizontal flex container',
    icon: '↔️',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    isContainer: true,
    defaultProps: { className: 'flex flex-row gap-4' },
  },
  FLEX_COL: {
    name: 'Flex Column',
    description: 'Vertical flex container',
    icon: '↕️',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    isContainer: true,
    defaultProps: { className: 'flex flex-col gap-4' },
  },
  GRID_2: {
    name: '2-Column Grid',
    description: 'Two column grid layout',
    icon: '⊞',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    isContainer: true,
    defaultProps: { className: 'grid grid-cols-2 gap-4' },
  },
  GRID_3: {
    name: '3-Column Grid',
    description: 'Three column grid layout',
    icon: '⊞',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    isContainer: true,
    defaultProps: { className: 'grid grid-cols-3 gap-4' },
  },
  GRID_4: {
    name: '4-Column Grid',
    description: 'Four column grid layout',
    icon: '⊞',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    isContainer: true,
    defaultProps: { className: 'grid grid-cols-4 gap-4' },
  },
  SECTION: {
    name: 'Section',
    description: 'Semantic section element',
    icon: '📋',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    isContainer: true,
    defaultProps: { className: 'py-8' },
  },
  DIV: {
    name: 'Div',
    description: 'Generic div element',
    icon: '▢',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    isContainer: true,
  },
  CARD: {
    name: 'Card',
    description: 'Card with border and shadow',
    icon: '🃏',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    isContainer: true,
    defaultProps: { className: 'p-4 rounded-lg border border-zinc-700 bg-zinc-900' },
  },
  PANEL: {
    name: 'Panel',
    description: 'Panel with header',
    icon: '📊',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    isContainer: true,
    defaultProps: { title: 'Panel Title' },
  },
  ACCORDION: {
    name: 'Accordion',
    description: 'Collapsible accordion',
    icon: '🪗',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    isContainer: true,
  },
  TABS: {
    name: 'Tabs',
    description: 'Tabbed content area',
    icon: '📑',
    category: 'layout',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    isContainer: true,
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  HEADING_1: {
    name: 'Heading 1',
    description: 'Large page heading',
    icon: 'H1',
    category: 'typography',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { text: 'Heading 1', className: 'text-4xl font-bold' },
  },
  HEADING_2: {
    name: 'Heading 2',
    description: 'Section heading',
    icon: 'H2',
    category: 'typography',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { text: 'Heading 2', className: 'text-2xl font-semibold' },
  },
  HEADING_3: {
    name: 'Heading 3',
    description: 'Subsection heading',
    icon: 'H3',
    category: 'typography',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { text: 'Heading 3', className: 'text-xl font-semibold' },
  },
  HEADING_4: {
    name: 'Heading 4',
    description: 'Small heading',
    icon: 'H4',
    category: 'typography',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { text: 'Heading 4', className: 'text-lg font-medium' },
  },
  PARAGRAPH: {
    name: 'Paragraph',
    description: 'Body text paragraph',
    icon: '¶',
    category: 'typography',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
  },
  TEXT_SPAN: {
    name: 'Text',
    description: 'Inline text span',
    icon: 'T',
    category: 'typography',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { text: 'Text content' },
  },
  LABEL: {
    name: 'Label',
    description: 'Form label text',
    icon: '🏷️',
    category: 'typography',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { text: 'Label', htmlFor: '' },
  },
  LINK: {
    name: 'Link',
    description: 'Hyperlink element',
    icon: '🔗',
    category: 'typography',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { text: 'Click here', href: '#', className: 'text-lime-400 hover:underline' },
  },
  BLOCKQUOTE: {
    name: 'Blockquote',
    description: 'Quote block',
    icon: '❝',
    category: 'typography',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    defaultProps: { text: 'A notable quote...', className: 'border-l-4 border-purple-500 pl-4 italic' },
  },
  CODE_BLOCK: {
    name: 'Code Block',
    description: 'Monospace code display',
    icon: '💻',
    category: 'typography',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    defaultProps: { code: 'const example = "Hello World";', language: 'javascript' },
  },

  // ============================================
  // FORM ELEMENTS
  // ============================================
  INPUT_TEXT: {
    name: 'Text Input',
    description: 'Single line text input',
    icon: '📝',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { placeholder: 'Enter text...', label: 'Label' },
  },
  INPUT_EMAIL: {
    name: 'Email Input',
    description: 'Email address input',
    icon: '📧',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { placeholder: 'email@example.com', label: 'Email' },
  },
  INPUT_PASSWORD: {
    name: 'Password Input',
    description: 'Password input field',
    icon: '🔐',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { placeholder: '••••••••', label: 'Password' },
  },
  INPUT_NUMBER: {
    name: 'Number Input',
    description: 'Numeric input field',
    icon: '🔢',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { placeholder: '0', label: 'Number', min: 0, max: 100 },
  },
  TEXTAREA: {
    name: 'Textarea',
    description: 'Multi-line text input',
    icon: '📄',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { placeholder: 'Enter description...', label: 'Description', rows: 4 },
  },
  SELECT: {
    name: 'Select',
    description: 'Dropdown select menu',
    icon: '📋',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { label: 'Select', options: ['Option 1', 'Option 2', 'Option 3'] },
  },
  CHECKBOX: {
    name: 'Checkbox',
    description: 'Boolean checkbox input',
    icon: '☑️',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { label: 'Check this option', checked: false },
  },
  RADIO: {
    name: 'Radio',
    description: 'Radio button group',
    icon: '🔘',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { label: 'Choose one', options: ['Option A', 'Option B'] },
  },
  SWITCH: {
    name: 'Switch',
    description: 'Toggle switch',
    icon: '🔀',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { label: 'Enable feature', checked: false },
  },
  SLIDER: {
    name: 'Slider',
    description: 'Range slider input',
    icon: '🎚️',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { label: 'Value', min: 0, max: 100, value: 50 },
  },
  BUTTON: {
    name: 'Button',
    description: 'Clickable button',
    icon: '🔲',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { text: 'Click Me', variant: 'primary' },
  },
  BUTTON_GROUP: {
    name: 'Button Group',
    description: 'Group of buttons',
    icon: '🔳',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    isContainer: true,
    defaultProps: { className: 'flex gap-2' },
  },
  FORM: {
    name: 'Form',
    description: 'Form container',
    icon: '📋',
    category: 'form',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    isContainer: true,
    defaultProps: { className: 'space-y-4' },
  },

  // ============================================
  // MEDIA
  // ============================================
  IMAGE: {
    name: 'Image',
    description: 'Image element',
    icon: '🖼️',
    category: 'media',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { src: '', alt: 'Image', className: 'rounded-lg' },
  },
  ICON: {
    name: 'Icon',
    description: 'Icon from library',
    icon: '⭐',
    category: 'media',
    defaultSize: { width: 24, height: 24 },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { name: 'star', size: 24 },
  },
  AVATAR: {
    name: 'Avatar',
    description: 'User avatar image',
    icon: '👤',
    category: 'media',
    defaultSize: { width: 40, height: 40 },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { src: '', fallback: 'U', size: 'md' },
  },
  VIDEO_EMBED: {
    name: 'Video Embed',
    description: 'Embedded video player',
    icon: '🎬',
    category: 'media',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    defaultProps: { src: '', aspectRatio: '16/9' },
  },
  PLACEHOLDER_IMAGE: {
    name: 'Placeholder',
    description: 'Placeholder image box',
    icon: '🎴',
    category: 'media',
    defaultSize: { width: 200, height: 150 },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { width: 200, height: 150, text: 'Image' },
  },

  // ============================================
  // NAVIGATION
  // ============================================
  NAVBAR: {
    name: 'Navbar',
    description: 'Navigation bar',
    icon: '🧭',
    category: 'navigation',
    defaultSize: { width: 'auto', height: 56 },
    allowedSections: ['header'],
    isContainer: true,
  },
  SIDEBAR_NAV: {
    name: 'Sidebar Nav',
    description: 'Sidebar navigation menu',
    icon: '📑',
    category: 'navigation',
    defaultSize: { width: 240, height: 'auto' },
    allowedSections: ['sidebar-left'],
    isContainer: true,
  },
  BREADCRUMBS: {
    name: 'Breadcrumbs',
    description: 'Navigation breadcrumbs',
    icon: '🥖',
    category: 'navigation',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    defaultProps: { items: ['Home', 'Section', 'Page'] },
  },
  TABS_NAV: {
    name: 'Tab Navigation',
    description: 'Horizontal tab navigation',
    icon: '📂',
    category: 'navigation',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    defaultProps: { tabs: ['Tab 1', 'Tab 2', 'Tab 3'] },
  },
  MENU: {
    name: 'Menu',
    description: 'Vertical menu list',
    icon: '☰',
    category: 'navigation',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left'],
    isContainer: true,
  },
  DROPDOWN: {
    name: 'Dropdown',
    description: 'Dropdown menu',
    icon: '▼',
    category: 'navigation',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { label: 'Menu', items: ['Item 1', 'Item 2'] },
  },

  // ============================================
  // DATA DISPLAY
  // ============================================
  BADGE: {
    name: 'Badge',
    description: 'Status badge label',
    icon: '🏅',
    category: 'data',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { text: 'New', variant: 'default' },
  },
  TAG: {
    name: 'Tag',
    description: 'Removable tag chip',
    icon: '🔖',
    category: 'data',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { text: 'Tag', removable: true },
  },
  STAT_CARD: {
    name: 'Stat Card',
    description: 'Statistic display card',
    icon: '📊',
    category: 'data',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    defaultProps: { label: 'Total Users', value: '1,234', change: '+12%' },
  },
  PROGRESS_BAR: {
    name: 'Progress Bar',
    description: 'Progress indicator',
    icon: '📶',
    category: 'data',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { value: 65, max: 100, label: 'Progress' },
  },
  LIST: {
    name: 'List',
    description: 'Unordered list container',
    icon: '📃',
    category: 'data',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    isContainer: true,
  },
  LIST_ITEM: {
    name: 'List Item',
    description: 'List item element',
    icon: '•',
    category: 'data',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { text: 'List item' },
  },
  TABLE: {
    name: 'Table',
    description: 'Data table',
    icon: '📋',
    category: 'data',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    defaultProps: { columns: ['Name', 'Value'], rows: [] },
  },
  DIVIDER: {
    name: 'Divider',
    description: 'Horizontal divider line',
    icon: '—',
    category: 'data',
    defaultSize: { width: 'auto', height: 1 },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { className: 'border-t border-zinc-700 my-4' },
  },
  SPACER: {
    name: 'Spacer',
    description: 'Empty space element',
    icon: '⬜',
    category: 'data',
    defaultSize: { width: 'auto', height: 32 },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { height: 32 },
  },

  // ============================================
  // FEEDBACK
  // ============================================
  ALERT: {
    name: 'Alert',
    description: 'Alert message box',
    icon: '⚠️',
    category: 'feedback',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['main'],
    defaultProps: { title: 'Alert', message: 'This is an alert message.', variant: 'info' },
  },
  TOAST: {
    name: 'Toast',
    description: 'Toast notification',
    icon: '🍞',
    category: 'feedback',
    defaultSize: { width: 320, height: 'auto' },
    allowedSections: ['main'],
    defaultProps: { message: 'Action completed!', variant: 'success' },
  },
  TOOLTIP: {
    name: 'Tooltip',
    description: 'Hover tooltip',
    icon: '💬',
    category: 'feedback',
    defaultSize: { width: 'auto', height: 'auto' },
    allowedSections: ['sidebar-left', 'main'],
    defaultProps: { text: 'Tooltip text', position: 'top' },
  },
  MODAL: {
    name: 'Modal',
    description: 'Modal dialog',
    icon: '🪟',
    category: 'feedback',
    defaultSize: { width: 480, height: 'auto' },
    allowedSections: ['main'],
    isContainer: true,
    defaultProps: { title: 'Modal Title', open: false },
  },
  LOADING_SPINNER: {
    name: 'Spinner',
    description: 'Loading spinner',
    icon: '🔄',
    category: 'feedback',
    defaultSize: { width: 40, height: 40 },
    allowedSections: ['sidebar-left', 'main', 'sidebar-right'],
    defaultProps: { size: 'md' },
  },
};

// Helper to get components by category
export const getComponentsByCategory = (category: ComponentCategory): ComponentType[] => {
  return (Object.keys(COMPONENT_CATALOG) as ComponentType[]).filter(
    (type) => COMPONENT_CATALOG[type].category === category
  );
};

// Category metadata for UI
export const CATEGORY_INFO: Record<ComponentCategory, { name: string; icon: string; description: string }> = {
  retrodiffusion: { name: 'RetroDiffusion', icon: '🎨', description: 'AI image generation components' },
  layout: { name: 'Layout', icon: '📦', description: 'Containers and structure' },
  typography: { name: 'Typography', icon: '🔤', description: 'Text and headings' },
  form: { name: 'Form', icon: '📝', description: 'Inputs and controls' },
  media: { name: 'Media', icon: '🖼️', description: 'Images and video' },
  navigation: { name: 'Navigation', icon: '🧭', description: 'Menus and links' },
  data: { name: 'Data Display', icon: '📊', description: 'Lists, tables, badges' },
  feedback: { name: 'Feedback', icon: '💬', description: 'Alerts and modals' },
};

// Backward compatibility alias
export const RD_COMPONENT_INFO = COMPONENT_CATALOG;
