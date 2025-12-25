/**
 * Workspace Store
 * Zustand store for managing workspace UI configuration and meta-edit mode
 */

import { create } from 'zustand';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import {
  WorkspaceConfig,
  PanelConfig,
  Section,
  ThemeConfig,
  MetaEditState,
  MetaElementType,
  ComponentGroup,
} from '@/types/workspace';
import { createDefaultWorkspace, getPreset } from '@/lib/workspace-defaults';
import { workspacePersistence } from '@/lib/workspace-persistence';

// ============================================
// STORE INTERFACE
// ============================================

export interface WorkspaceStore {
  // Current workspace configuration
  workspace: WorkspaceConfig;
  
  // Meta-edit mode state
  metaEdit: MetaEditState;
  
  // Loading state
  isLoading: boolean;
  isInitialized: boolean;
  
  // =====================
  // INITIALIZATION
  // =====================
  initialize: () => Promise<void>;
  
  // =====================
  // META EDIT MODE
  // =====================
  toggleMetaEditMode: () => void;
  setMetaEditMode: (active: boolean) => void;
  selectMetaElement: (id: string | null, type: MetaElementType | null) => void;
  hoverMetaElement: (id: string | null) => void;
  clearMetaSelection: () => void;
  
  // =====================
  // PANEL ACTIONS
  // =====================
  updatePanel: (panelId: string, updates: Partial<PanelConfig>) => void;
  resizePanel: (panelId: string, size: number) => void;
  togglePanelVisibility: (panelId: string) => void;
  togglePanelCollapse: (panelId: string) => void;
  
  // =====================
  // SECTION ACTIONS
  // =====================
  addSection: (panelId: string, section: Partial<Section>) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (panelId: string, fromIndex: number, toIndex: number) => void;
  toggleSectionCollapse: (sectionId: string) => void;
  moveSection: (sectionId: string, fromPanelId: string, toPanelId: string, toIndex: number) => void;
  
  // =====================
  // COMPONENT GROUP ACTIONS
  // =====================
  addComponentGroup: (sectionId: string, group: Partial<ComponentGroup>) => void;
  updateComponentGroup: (groupId: string, updates: Partial<ComponentGroup>) => void;
  deleteComponentGroup: (groupId: string) => void;
  reorderComponentGroups: (sectionId: string, fromIndex: number, toIndex: number) => void;
  toggleComponentGroupCollapse: (groupId: string) => void;
  
  // =====================
  // THEME ACTIONS
  // =====================
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  toggleThemeMode: () => void;
  
  // =====================
  // WORKSPACE MANAGEMENT
  // =====================
  saveWorkspace: () => Promise<void>;
  loadWorkspace: (id: string) => Promise<void>;
  resetWorkspace: () => void;
  applyPreset: (presetName: string) => void;
  duplicateWorkspace: (name?: string) => Promise<string | null>;
  
  // =====================
  // HELPERS
  // =====================
  getPanelById: (panelId: string) => PanelConfig | null;
  getSectionById: (sectionId: string) => { section: Section; panelId: string } | null;
  getComponentGroupById: (groupId: string) => ComponentGroup | null;
}

// ============================================
// HELPER: Find panel by ID
// ============================================

const findPanelById = (workspace: WorkspaceConfig, panelId: string): PanelConfig | null => {
  const panels = workspace.layout.panels;
  if (panels.leftSidebar.id === panelId) return panels.leftSidebar;
  if (panels.rightSidebar.id === panelId) return panels.rightSidebar;
  if (panels.header.id === panelId) return panels.header;
  if (panels.footer.id === panelId) return panels.footer;
  return null;
};

// ============================================
// HELPER: Find section by ID
// ============================================

const findSectionById = (workspace: WorkspaceConfig, sectionId: string): { section: Section; panelId: string; index: number } | null => {
  const panels = workspace.layout.panels;
  const panelEntries = Object.entries(panels) as [string, PanelConfig][];
  
  for (const [_, panel] of panelEntries) {
    const index = panel.sections.findIndex(s => s.id === sectionId);
    if (index !== -1) {
      return { section: panel.sections[index], panelId: panel.id, index };
    }
  }
  return null;
};

// ============================================
// HELPER: Find component group by ID
// ============================================

const findComponentGroupById = (workspace: WorkspaceConfig, groupId: string): ComponentGroup | null => {
  const panels = workspace.layout.panels;
  const allSections = [
    ...panels.leftSidebar.sections,
    ...panels.rightSidebar.sections,
    ...panels.header.sections,
    ...panels.footer.sections,
  ];
  
  for (const section of allSections) {
    if (section.content?.componentGroups) {
      const group = section.content.componentGroups.find(g => g.id === groupId);
      if (group) return group;
    }
  }
  return null;
};

// ============================================
// STORE CREATION
// ============================================

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  // Initial state
  workspace: createDefaultWorkspace(),
  metaEdit: {
    isActive: false,
    selectedElementId: null,
    selectedElementType: null,
    hoveredElementId: null,
  },
  isLoading: false,
  isInitialized: false,

  // =====================
  // INITIALIZATION
  // =====================
  initialize: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    
    try {
      // Try to load saved workspace
      const currentId = await workspacePersistence.getCurrentWorkspaceId();
      if (currentId) {
        const saved = await workspacePersistence.loadWorkspace(currentId);
        if (saved) {
          set({ workspace: saved, isLoading: false, isInitialized: true });
          return;
        }
      }
      
      // No saved workspace, use default
      const defaultWorkspace = createDefaultWorkspace();
      await workspacePersistence.saveWorkspace(defaultWorkspace);
      await workspacePersistence.setCurrentWorkspaceId(defaultWorkspace.id);
      
      set({ workspace: defaultWorkspace, isLoading: false, isInitialized: true });
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
      set({ workspace: createDefaultWorkspace(), isLoading: false, isInitialized: true });
    }
  },

  // =====================
  // META EDIT MODE
  // =====================
  toggleMetaEditMode: () => set(produce((state: WorkspaceStore) => {
    state.metaEdit.isActive = !state.metaEdit.isActive;
    if (!state.metaEdit.isActive) {
      state.metaEdit.selectedElementId = null;
      state.metaEdit.selectedElementType = null;
      state.metaEdit.hoveredElementId = null;
    }
  })),

  setMetaEditMode: (active) => set(produce((state: WorkspaceStore) => {
    state.metaEdit.isActive = active;
    if (!active) {
      state.metaEdit.selectedElementId = null;
      state.metaEdit.selectedElementType = null;
      state.metaEdit.hoveredElementId = null;
    }
  })),

  selectMetaElement: (id, type) => set(produce((state: WorkspaceStore) => {
    state.metaEdit.selectedElementId = id;
    state.metaEdit.selectedElementType = type;
  })),

  hoverMetaElement: (id) => set(produce((state: WorkspaceStore) => {
    state.metaEdit.hoveredElementId = id;
  })),

  clearMetaSelection: () => set(produce((state: WorkspaceStore) => {
    state.metaEdit.selectedElementId = null;
    state.metaEdit.selectedElementType = null;
  })),

  // =====================
  // PANEL ACTIONS
  // =====================
  updatePanel: (panelId, updates) => set(produce((state: WorkspaceStore) => {
    const panels = state.workspace.layout.panels;
    if (panels.leftSidebar.id === panelId) Object.assign(panels.leftSidebar, updates);
    else if (panels.rightSidebar.id === panelId) Object.assign(panels.rightSidebar, updates);
    else if (panels.header.id === panelId) Object.assign(panels.header, updates);
    else if (panels.footer.id === panelId) Object.assign(panels.footer, updates);
    state.workspace.updatedAt = Date.now();
  })),

  resizePanel: (panelId, size) => set(produce((state: WorkspaceStore) => {
    const panels = state.workspace.layout.panels;
    const panel = findPanelById(state.workspace, panelId);
    if (!panel) return;

    if (panel.position === 'left' || panel.position === 'right') {
      const clampedSize = Math.min(Math.max(size, panel.minWidth || 100), panel.maxWidth || 600);
      if (panels.leftSidebar.id === panelId) panels.leftSidebar.width = clampedSize;
      else if (panels.rightSidebar.id === panelId) panels.rightSidebar.width = clampedSize;
    } else {
      const clampedSize = Math.min(Math.max(size, panel.minHeight || 32), panel.maxHeight || 200);
      if (panels.header.id === panelId) panels.header.height = clampedSize;
      else if (panels.footer.id === panelId) panels.footer.height = clampedSize;
    }
    state.workspace.updatedAt = Date.now();
  })),

  togglePanelVisibility: (panelId) => set(produce((state: WorkspaceStore) => {
    const panels = state.workspace.layout.panels;
    if (panels.leftSidebar.id === panelId) panels.leftSidebar.visible = !panels.leftSidebar.visible;
    else if (panels.rightSidebar.id === panelId) panels.rightSidebar.visible = !panels.rightSidebar.visible;
    else if (panels.header.id === panelId) panels.header.visible = !panels.header.visible;
    else if (panels.footer.id === panelId) panels.footer.visible = !panels.footer.visible;
    state.workspace.updatedAt = Date.now();
  })),

  togglePanelCollapse: (panelId) => set(produce((state: WorkspaceStore) => {
    const panels = state.workspace.layout.panels;
    if (panels.leftSidebar.id === panelId) panels.leftSidebar.collapsed = !panels.leftSidebar.collapsed;
    else if (panels.rightSidebar.id === panelId) panels.rightSidebar.collapsed = !panels.rightSidebar.collapsed;
    else if (panels.header.id === panelId) panels.header.collapsed = !panels.header.collapsed;
    else if (panels.footer.id === panelId) panels.footer.collapsed = !panels.footer.collapsed;
    state.workspace.updatedAt = Date.now();
  })),

  // =====================
  // SECTION ACTIONS
  // =====================
  addSection: (panelId, sectionData) => set(produce((state: WorkspaceStore) => {
    const panels = state.workspace.layout.panels;
    const panel = findPanelById(state.workspace, panelId);
    if (!panel) return;

    const newSection: Section = {
      id: sectionData.id || `section_${nanoid(8)}`,
      title: sectionData.title || 'New Section',
      icon: sectionData.icon || 'Folder',
      order: sectionData.order ?? panel.sections.length,
      collapsed: sectionData.collapsed ?? false,
      visible: sectionData.visible ?? true,
      editable: sectionData.editable ?? true,
      deletable: sectionData.deletable ?? true,
      type: sectionData.type || 'custom',
      content: sectionData.content,
    };

    // Add to the correct panel
    if (panels.leftSidebar.id === panelId) panels.leftSidebar.sections.push(newSection);
    else if (panels.rightSidebar.id === panelId) panels.rightSidebar.sections.push(newSection);
    else if (panels.header.id === panelId) panels.header.sections.push(newSection);
    else if (panels.footer.id === panelId) panels.footer.sections.push(newSection);
    
    state.workspace.updatedAt = Date.now();
  })),

  updateSection: (sectionId, updates) => set(produce((state: WorkspaceStore) => {
    const result = findSectionById(state.workspace, sectionId);
    if (!result) return;

    const panels = state.workspace.layout.panels;
    const panelEntries = [
      ['leftSidebar', panels.leftSidebar],
      ['rightSidebar', panels.rightSidebar],
      ['header', panels.header],
      ['footer', panels.footer],
    ] as const;

    for (const [_, panel] of panelEntries) {
      const section = panel.sections.find(s => s.id === sectionId);
      if (section) {
        Object.assign(section, updates);
        break;
      }
    }
    state.workspace.updatedAt = Date.now();
  })),

  deleteSection: (sectionId) => set(produce((state: WorkspaceStore) => {
    const panels = state.workspace.layout.panels;
    const panelArrays = [
      panels.leftSidebar.sections,
      panels.rightSidebar.sections,
      panels.header.sections,
      panels.footer.sections,
    ];

    for (const sections of panelArrays) {
      const index = sections.findIndex(s => s.id === sectionId);
      if (index !== -1) {
        const section = sections[index];
        if (section.deletable) {
          sections.splice(index, 1);
        }
        break;
      }
    }
    state.workspace.updatedAt = Date.now();
  })),

  reorderSections: (panelId, fromIndex, toIndex) => set(produce((state: WorkspaceStore) => {
    const panels = state.workspace.layout.panels;
    let sections: Section[] | null = null;

    if (panels.leftSidebar.id === panelId) sections = panels.leftSidebar.sections;
    else if (panels.rightSidebar.id === panelId) sections = panels.rightSidebar.sections;
    else if (panels.header.id === panelId) sections = panels.header.sections;
    else if (panels.footer.id === panelId) sections = panels.footer.sections;

    if (sections && fromIndex !== toIndex) {
      const [moved] = sections.splice(fromIndex, 1);
      sections.splice(toIndex, 0, moved);
      // Update order values
      sections.forEach((s, i) => { s.order = i; });
    }
    state.workspace.updatedAt = Date.now();
  })),

  toggleSectionCollapse: (sectionId) => set(produce((state: WorkspaceStore) => {
    const result = findSectionById(state.workspace, sectionId);
    if (!result) return;
    result.section.collapsed = !result.section.collapsed;
    state.workspace.updatedAt = Date.now();
  })),

  moveSection: (sectionId, fromPanelId, toPanelId, toIndex) => set(produce((state: WorkspaceStore) => {
    const panels = state.workspace.layout.panels;
    const panelMap: Record<string, PanelConfig> = {
      [panels.leftSidebar.id]: panels.leftSidebar,
      [panels.rightSidebar.id]: panels.rightSidebar,
      [panels.header.id]: panels.header,
      [panels.footer.id]: panels.footer,
    };

    const fromPanel = panelMap[fromPanelId];
    const toPanel = panelMap[toPanelId];
    if (!fromPanel || !toPanel) return;

    const fromIndex = fromPanel.sections.findIndex(s => s.id === sectionId);
    if (fromIndex === -1) return;

    const [section] = fromPanel.sections.splice(fromIndex, 1);
    toPanel.sections.splice(toIndex, 0, section);

    // Update order values
    fromPanel.sections.forEach((s, i) => { s.order = i; });
    toPanel.sections.forEach((s, i) => { s.order = i; });
    
    state.workspace.updatedAt = Date.now();
  })),

  // =====================
  // COMPONENT GROUP ACTIONS
  // =====================
  addComponentGroup: (sectionId, groupData) => set(produce((state: WorkspaceStore) => {
    const result = findSectionById(state.workspace, sectionId);
    if (!result) return;

    if (!result.section.content) {
      result.section.content = { componentGroups: [] };
    }
    if (!result.section.content.componentGroups) {
      result.section.content.componentGroups = [];
    }

    const newGroup: ComponentGroup = {
      id: groupData.id || `group_${nanoid(8)}`,
      title: groupData.title || 'New Group',
      collapsed: groupData.collapsed ?? false,
      components: groupData.components || [],
    };

    result.section.content.componentGroups.push(newGroup);
    state.workspace.updatedAt = Date.now();
  })),

  updateComponentGroup: (groupId, updates) => set(produce((state: WorkspaceStore) => {
    const panels = state.workspace.layout.panels;
    const allSections = [
      ...panels.leftSidebar.sections,
      ...panels.rightSidebar.sections,
      ...panels.header.sections,
      ...panels.footer.sections,
    ];

    for (const section of allSections) {
      if (section.content?.componentGroups) {
        const group = section.content.componentGroups.find(g => g.id === groupId);
        if (group) {
          Object.assign(group, updates);
          break;
        }
      }
    }
    state.workspace.updatedAt = Date.now();
  })),

  deleteComponentGroup: (groupId) => set(produce((state: WorkspaceStore) => {
    const panels = state.workspace.layout.panels;
    const allSections = [
      ...panels.leftSidebar.sections,
      ...panels.rightSidebar.sections,
      ...panels.header.sections,
      ...panels.footer.sections,
    ];

    for (const section of allSections) {
      if (section.content?.componentGroups) {
        const index = section.content.componentGroups.findIndex(g => g.id === groupId);
        if (index !== -1) {
          section.content.componentGroups.splice(index, 1);
          break;
        }
      }
    }
    state.workspace.updatedAt = Date.now();
  })),

  reorderComponentGroups: (sectionId, fromIndex, toIndex) => set(produce((state: WorkspaceStore) => {
    const result = findSectionById(state.workspace, sectionId);
    if (!result || !result.section.content?.componentGroups) return;

    const groups = result.section.content.componentGroups;
    if (fromIndex !== toIndex) {
      const [moved] = groups.splice(fromIndex, 1);
      groups.splice(toIndex, 0, moved);
    }
    state.workspace.updatedAt = Date.now();
  })),

  toggleComponentGroupCollapse: (groupId) => set(produce((state: WorkspaceStore) => {
    const group = findComponentGroupById(state.workspace, groupId);
    if (group) {
      group.collapsed = !group.collapsed;
    }
    state.workspace.updatedAt = Date.now();
  })),

  // =====================
  // THEME ACTIONS
  // =====================
  updateTheme: (updates) => set(produce((state: WorkspaceStore) => {
    Object.assign(state.workspace.theme, updates);
    state.workspace.updatedAt = Date.now();
  })),

  toggleThemeMode: () => set(produce((state: WorkspaceStore) => {
    state.workspace.theme.mode = state.workspace.theme.mode === 'dark' ? 'light' : 'dark';
    state.workspace.updatedAt = Date.now();
  })),

  // =====================
  // WORKSPACE MANAGEMENT
  // =====================
  saveWorkspace: async () => {
    const state = get();
    try {
      await workspacePersistence.saveWorkspace(state.workspace);
      await workspacePersistence.setCurrentWorkspaceId(state.workspace.id);
    } catch (error) {
      console.error('Failed to save workspace:', error);
    }
  },

  loadWorkspace: async (id) => {
    set({ isLoading: true });
    try {
      const workspace = await workspacePersistence.loadWorkspace(id);
      if (workspace) {
        set({ workspace, isLoading: false });
        await workspacePersistence.setCurrentWorkspaceId(id);
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load workspace:', error);
      set({ isLoading: false });
    }
  },

  resetWorkspace: () => {
    const defaultWorkspace = createDefaultWorkspace();
    set({ workspace: defaultWorkspace });
  },

  applyPreset: (presetName) => {
    const preset = getPreset(presetName);
    if (preset) {
      set(produce((state: WorkspaceStore) => {
        // Preserve current workspace ID and timestamps
        const currentId = state.workspace.id;
        state.workspace = {
          ...preset,
          id: currentId,
          name: state.workspace.name,
          createdAt: state.workspace.createdAt,
          updatedAt: Date.now(),
          isDefault: false,
          isPreset: false,
        };
      }));
    }
  },

  duplicateWorkspace: async (name) => {
    const state = get();
    try {
      const duplicate = await workspacePersistence.duplicateWorkspace(state.workspace.id, name);
      return duplicate?.id || null;
    } catch (error) {
      console.error('Failed to duplicate workspace:', error);
      return null;
    }
  },

  // =====================
  // HELPERS
  // =====================
  getPanelById: (panelId) => {
    return findPanelById(get().workspace, panelId);
  },

  getSectionById: (sectionId) => {
    const result = findSectionById(get().workspace, sectionId);
    if (!result) return null;
    return { section: result.section, panelId: result.panelId };
  },

  getComponentGroupById: (groupId) => {
    return findComponentGroupById(get().workspace, groupId);
  },
}));

// ============================================
// KEYBOARD SHORTCUT HOOK (for meta-edit toggle)
// ============================================

export const setupWorkspaceKeyboardShortcuts = () => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Cmd/Ctrl + Shift + E to toggle meta-edit mode
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'e') {
      e.preventDefault();
      useWorkspaceStore.getState().toggleMetaEditMode();
    }
    
    // Escape to exit meta-edit mode
    if (e.key === 'Escape') {
      const state = useWorkspaceStore.getState();
      if (state.metaEdit.isActive) {
        e.preventDefault();
        state.setMetaEditMode(false);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
};
