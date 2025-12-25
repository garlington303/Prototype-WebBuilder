import { create } from 'zustand';
import { produce } from 'immer';
import { nanoid } from 'nanoid';

export type ComponentType = 'container' | 'button' | 'card' | 'header' | 'text' | 'input';

// Position and size for free-form canvas placement
export interface ComponentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Component {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  children: Component[];
  parentId?: string | null;
  // Free-form positioning
  position: ComponentPosition;
}

export interface BuilderState {
  components: Component[];
  selectedId: string | null;
  mode: 'edit' | 'preview';
  // Actions
  addComponent: (type: ComponentType, position?: { x: number; y: number }) => void;
  updateComponent: (id: string, props: Record<string, any>) => void;
  updateComponentPosition: (id: string, position: Partial<ComponentPosition>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  reorderComponent: (activeId: string, overId: string) => void;
  setMode: (mode: 'edit' | 'preview') => void;
  reset: () => void;
}
// Helper to find a node and its parent array in the tree
const findNode = (nodes: Component[], id: string): { node: Component; parentArray: Component[]; index: number } | null => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      return { node: nodes[i], parentArray: nodes, index: i };
    }
    if (nodes[i].children.length > 0) {
      const result = findNode(nodes[i].children, id);
      if (result) return result;
    }
  }
  return null;
};
// Default props for new components
const getDefaultProps = (type: ComponentType): Record<string, any> => {
  switch (type) {
    case 'container':
      return {
        // Added flex flex-col to match default layout
        className: 'p-4 border border-dashed border-border min-h-[100px] rounded-lg bg-background/50 flex flex-col',
        layout: 'flex-col'
      };
    case 'button':
      return {
        children: 'Click Me',
        variant: 'default',
        size: 'default',
        fontSize: 14,
        className: ''
      };
    case 'card':
      return {
        title: 'Card Title',
        description: 'Card description goes here.',
        content: 'Card content area.',
        footer: 'Footer action',
        fontSize: 16,
        className: 'w-full'
      };
    case 'header':
      return {
        children: 'Heading Text',
        level: 'h2',
        fontSize: 24,
        className: 'font-bold'
      };
    case 'text':
      return {
        children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        fontSize: 16,
        className: 'text-muted-foreground'
      };
    case 'input':
      return {
        placeholder: 'Enter text...',
        label: 'Label',
        type: 'text',
        fontSize: 14,
        className: ''
      };
    default:
      return {};
  }
};

// Default sizes for different component types
const getDefaultSize = (type: ComponentType): { width: number; height: number } => {
  switch (type) {
    case 'container':
      return { width: 400, height: 200 };
    case 'card':
      return { width: 350, height: 250 };
    case 'button':
      return { width: 120, height: 40 };
    case 'header':
      return { width: 300, height: 50 };
    case 'text':
      return { width: 300, height: 80 };
    case 'input':
      return { width: 250, height: 70 };
    default:
      return { width: 200, height: 100 };
  }
};

export const useBuilderStore = create<BuilderState>((set) => ({
  components: [],
  selectedId: null,
  mode: 'edit',

  addComponent: (type, position) => set(produce((state: BuilderState) => {
    const defaultSize = getDefaultSize(type);
    const newComponent: Component = {
      id: nanoid(),
      type,
      props: getDefaultProps(type),
      children: [],
      parentId: null,
      position: {
        x: position?.x ?? 100,
        y: position?.y ?? 100,
        width: defaultSize.width,
        height: defaultSize.height,
      },
    };
    state.components.push(newComponent);
    // Auto-select the new component
    state.selectedId = newComponent.id;
  })),

  updateComponent: (id, props) => set(produce((state: BuilderState) => {
    const result = findNode(state.components, id);
    if (result) {
      result.node.props = { ...result.node.props, ...props };
    }
  })),

  updateComponentPosition: (id, position) => set(produce((state: BuilderState) => {
    const result = findNode(state.components, id);
    if (result) {
      result.node.position = { ...result.node.position, ...position };
    }
  })),

  removeComponent: (id) => set(produce((state: BuilderState) => {
    const result = findNode(state.components, id);
    if (result) {
      result.parentArray.splice(result.index, 1);
      if (state.selectedId === id) {
        state.selectedId = null;
      }
    }
  })),

  selectComponent: (id) => set({ selectedId: id }),
  
  reorderComponent: (activeId, overId) => set(produce((state: BuilderState) => {
    const activeResult = findNode(state.components, activeId);
    const overResult = findNode(state.components, overId);

    if (activeResult && overResult && activeResult.parentArray === overResult.parentArray) {
      const activeIndex = activeResult.index;
      const overIndex = overResult.index;

      if (activeIndex !== overIndex) {
        const [movedItem] = activeResult.parentArray.splice(activeIndex, 1);
        activeResult.parentArray.splice(overIndex, 0, movedItem);
      }
    }
  })),

  setMode: (mode) => set({ mode, selectedId: null }), // Deselect when changing modes
  reset: () => set({ components: [], selectedId: null, mode: 'edit' }),
}));