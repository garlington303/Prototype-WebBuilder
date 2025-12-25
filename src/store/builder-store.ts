import { create } from 'zustand';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
export type ComponentType = 'container' | 'button' | 'card' | 'header' | 'text' | 'input';
export interface Component {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  children: Component[];
  parentId?: string | null;
}
export interface BuilderState {
  components: Component[];
  selectedId: string | null;
  mode: 'edit' | 'preview';
  // Actions
  addComponent: (type: ComponentType, parentId?: string) => void;
  updateComponent: (id: string, props: Record<string, any>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
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
        className: 'p-4 border border-dashed border-border min-h-[100px] rounded-lg bg-background/50',
        layout: 'flex-col' 
      };
    case 'button':
      return { 
        children: 'Click Me', 
        variant: 'default', 
        size: 'default',
        className: ''
      };
    case 'card':
      return { 
        title: 'Card Title', 
        description: 'Card description goes here.',
        content: 'Card content area.',
        footer: 'Footer action',
        className: 'w-full'
      };
    case 'header':
      return { 
        children: 'Heading Text', 
        level: 'h2',
        className: 'text-2xl font-bold'
      };
    case 'text':
      return { 
        children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        className: 'text-muted-foreground'
      };
    case 'input':
      return {
        placeholder: 'Enter text...',
        label: 'Label',
        type: 'text',
        className: ''
      };
    default:
      return {};
  }
};
export const useBuilderStore = create<BuilderState>((set) => ({
  components: [],
  selectedId: null,
  mode: 'edit',
  addComponent: (type, parentId) => set(produce((state: BuilderState) => {
    const newComponent: Component = {
      id: nanoid(),
      type,
      props: getDefaultProps(type),
      children: [],
      parentId: parentId || null,
    };
    if (!parentId || parentId === 'root') {
      state.components.push(newComponent);
    } else {
      const result = findNode(state.components, parentId);
      if (result) {
        result.node.children.push(newComponent);
      } else {
        // Fallback to root if parent not found
        state.components.push(newComponent);
      }
    }
    // Auto-select the new component
    state.selectedId = newComponent.id;
  })),
  updateComponent: (id, props) => set(produce((state: BuilderState) => {
    const result = findNode(state.components, id);
    if (result) {
      result.node.props = { ...result.node.props, ...props };
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
  setMode: (mode) => set({ mode, selectedId: null }), // Deselect when changing modes
  reset: () => set({ components: [], selectedId: null, mode: 'edit' }),
}));