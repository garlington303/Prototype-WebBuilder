/**
 * Workspace Types
 * Core type definitions for the dynamic workspace system
 */

import { ComponentType } from '@/store/builder-store';

// ============================================
// PANEL CONFIGURATION
// ============================================

export type PanelPosition = 'left' | 'right' | 'top' | 'bottom';

export interface PanelConfig {
  id: string;
  visible: boolean;
  width?: number;      // For left/right panels
  height?: number;     // For top/bottom panels
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  position: PanelPosition;
  resizable: boolean;
  collapsible: boolean;
  collapsed: boolean;
  sections: Section[];
}

// ============================================
// SECTION CONFIGURATION
// ============================================

export interface Section {
  id: string;
  title: string;
  icon: string;          // Lucide icon name
  order: number;
  collapsed: boolean;
  visible: boolean;
  editable: boolean;     // Can be edited in meta mode
  deletable: boolean;    // Can be deleted in meta mode
  type: SectionType;
  content?: SectionContent;
}

export type SectionType = 
  | 'component-palette'   // Draggable components
  | 'layer-tree'          // Component hierarchy
  | 'properties'          // Property editor
  | 'ai-prompt'           // AI assistant
  | 'custom';             // User-defined content

export interface SectionContent {
  // For component-palette sections
  componentGroups?: ComponentGroup[];
  // For custom sections
  customContent?: any;
}

export interface ComponentGroup {
  id: string;
  title: string;
  collapsed: boolean;
  components: ComponentDefinition[];
}

export interface ComponentDefinition {
  id: string;
  type: ComponentType;
  label: string;
  icon: string;
  description?: string;
}

// ============================================
// CANVAS CONFIGURATION
// ============================================

export interface CanvasConfig {
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  backgroundColor: string;
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
}

// ============================================
// THEME CONFIGURATION
// ============================================

export interface ThemeConfig {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  borderRadius: number;
  fontFamily: string;
  fontSize: number;
  customCSS?: string;
}

// ============================================
// LAYOUT CONFIGURATION
// ============================================

export interface LayoutConfig {
  panels: {
    leftSidebar: PanelConfig;
    rightSidebar: PanelConfig;
    header: PanelConfig;
    footer: PanelConfig;
  };
  canvas: CanvasConfig;
}

// ============================================
// WORKSPACE CONFIGURATION
// ============================================

export interface WorkspaceConfig {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: number;
  updatedAt: number;
  layout: LayoutConfig;
  theme: ThemeConfig;
  isDefault?: boolean;
  isPreset?: boolean;
}

// ============================================
// META EDIT STATE
// ============================================

export interface MetaEditState {
  isActive: boolean;
  selectedElementId: string | null;
  selectedElementType: MetaElementType | null;
  hoveredElementId: string | null;
}

export type MetaElementType = 'panel' | 'section' | 'component-group';

// ============================================
// PERSISTENCE TYPES
// ============================================

export interface WorkspaceExport {
  version: string;
  exportedAt: number;
  workspace: WorkspaceConfig;
}

export interface PersistenceAdapter {
  save(key: string, data: unknown): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
  clear(prefix?: string): Promise<void>;
}
