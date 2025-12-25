# Aetheria Builder — Technical Blueprint

> A sophisticated drag-and-drop visual web builder with AI capabilities that generates production-ready UI blueprints.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Design System](#design-system)
3. [Tech Stack & Dependencies](#tech-stack--dependencies)
4. [Architecture Overview](#architecture-overview)
5. [Data Models & Interfaces](#data-models--interfaces)
6. [State Management](#state-management)
7. [File Structure](#file-structure)
8. [Component Specifications](#component-specifications)
9. [User Flows](#user-flows)
10. [Implementation Phases](#implementation-phases)
11. [Pitfalls & Considerations](#pitfalls--considerations)
12. [API Reference](#api-reference)

---

## Project Overview

### Vision

Aetheria Builder is a next-generation visual web builder that empowers designers and developers to create production-ready UI layouts through an intuitive drag-and-drop interface. The application generates structured blueprints in markdown format, enabling seamless handoff to AI agents or development teams.

### Core Features

- **Visual Component Library** — Pre-built shadcn/ui components ready for drag-and-drop
- **Recursive Canvas Rendering** — Nested component trees with real-time preview
- **Property Editor** — Context-aware editing panel for component customization
- **Blueprint Generation** — Automatic markdown export of component hierarchy
- **Layer Management** — Visual tree navigation and component organization
- **Preview Mode** — Clean simulation of the final user experience

---

## Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#0F172A` | Primary dark background (Slate 900) |
| `--primary` | `#3B82F6` | Interactive elements, selection highlights (Blue 500) |
| `--accent` | `#10B981` | Success states, confirmations (Emerald 500) |
| `--foreground` | `#F8FAFC` | Primary text (Slate 50) |
| `--muted` | `#64748B` | Secondary text, borders (Slate 500) |
| `--destructive` | `#EF4444` | Error states, delete actions (Red 500) |

### Typography

```css
--font-ui: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

--text-xs: 0.75rem;    /* 12px - labels, hints */
--text-sm: 0.875rem;   /* 14px - body text */
--text-base: 1rem;     /* 16px - default */
--text-lg: 1.125rem;   /* 18px - subheadings */
--text-xl: 1.25rem;    /* 20px - headings */
--text-2xl: 1.5rem;    /* 24px - page titles */
```

### Visual Effects

| Effect | Implementation |
|--------|----------------|
| Glassmorphism | `bg-background/80 backdrop-blur-md border border-white/10` |
| Selection Glow | `ring-2 ring-primary shadow-[0_0_20px_rgba(59,130,246,0.3)]` |
| Drag Ghost | `opacity-50 scale-105 rotate-2` |
| Hover State | `bg-white/5 transition-colors duration-150` |
| Grid Background | `bg-[radial-gradient(circle,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]` |

### Spacing Scale

```
4px  (1)  — tight gaps
8px  (2)  — element padding
12px (3)  — card padding
16px (4)  — section gaps
24px (6)  — panel padding
32px (8)  — major sections
```

---

## Tech Stack & Dependencies

### Core Framework

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.x | UI framework |
| `typescript` | ^5.x | Type safety |
| `vite` | ^5.x | Build tooling |
| `tailwindcss` | ^3.x | Utility-first CSS |

### Drag & Drop

| Package | Purpose |
|---------|---------|
| `@dnd-kit/core` | Core drag-and-drop primitives |
| `@dnd-kit/sortable` | Sortable list functionality |
| `@dnd-kit/utilities` | CSS transform utilities |

### State & Utilities

| Package | Purpose |
|---------|---------|
| `zustand` | Lightweight state management |
| `nanoid` | Unique ID generation |
| `clsx` | Conditional class names |
| `tailwind-merge` | Merge Tailwind classes intelligently |
| `lucide-react` | Icon library |
| `react-markdown` | Markdown rendering |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Application Shell                         │
├──────────┬────────────────────────────────┬────────────────────┤
│          │                                │                    │
│  Left    │         Canvas Area            │      Right         │
│  Sidebar │                                │      Sidebar       │
│  (w-64)  │         (flex-1)               │      (w-80)        │
│          │                                │                    │
│ ┌──────┐ │  ┌──────────────────────────┐  │  ┌──────────────┐  │
│ │Comp  │ │  │                          │  │  │  Properties  │  │
│ │Lib   │ │  │     Render Frame         │  │  │    Panel     │  │
│ ├──────┤ │  │                          │  │  ├──────────────┤  │
│ │Layer │ │  │  ┌────────────────────┐  │  │  │   Inputs     │  │
│ │Tree  │ │  │  │  ComponentNode     │  │  │  │   Selects    │  │
│ ├──────┤ │  │  │  ┌──────────────┐  │  │  │  │   Toggles    │  │
│ │Global│ │  │  │  │ChildNode    │  │  │  │  │              │  │
│ │Sets  │ │  │  │  └──────────────┘  │  │  │  │              │  │
│ └──────┘ │  │  └────────────────────┘  │  │  └──────────────┘  │
│          │  │                          │  │                    │
│          │  └──────────────────────────┘  │                    │
│          │                                │                    │
└──────────┴────────────────────────────────┴────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │      Zustand Store            │
              │  ┌─────────────────────────┐  │
              │  │    Component Tree       │  │
              │  │    selectedNodeId       │  │
              │  │    viewMode             │  │
              │  └─────────────────────────┘  │
              └───────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌─────────────────┐  ┌─────────────────┐
          │   Recursive     │  │   Blueprint     │
          │   Renderer      │  │   Generator     │
          └─────────────────┘  └─────────────────┘
```

### Data Flow

1. **User Action** → Drag component from palette
2. **DnD Event** → `@dnd-kit` emits drop event with position data
3. **Store Update** → Zustand action adds node to component tree
4. **Re-render** → `RecursiveRenderer` traverses updated tree
5. **Blueprint Sync** → Generator serializes tree to markdown on demand

---

## Data Models & Interfaces

### ComponentNode

The fundamental unit of the component tree.

```typescript
interface ComponentNode {
  id: string;                    // Unique identifier (nanoid)
  type: ComponentType;           // Registry key (e.g., 'BUTTON', 'CARD')
  props: Record<string, unknown>;// Component-specific properties
  children: string[];            // Array of child node IDs
  parentId: string | null;       // Parent node ID (null for root)
}

type ComponentType = 
  | 'CONTAINER'
  | 'HEADER'
  | 'TEXT'
  | 'BUTTON'
  | 'CARD'
  | 'INPUT'
  | 'IMAGE'
  | 'DIVIDER'
  | 'COLUMNS'
  | 'GRID';
```

### ComponentRegistry Entry

Defines metadata and defaults for each component type.

```typescript
interface RegistryEntry {
  type: ComponentType;
  label: string;                          // Display name in palette
  icon: LucideIcon;                       // Palette icon
  component: React.ComponentType<any>;    // Actual React component
  defaultProps: Record<string, unknown>;  // Initial prop values
  acceptsChildren: boolean;               // Can contain other nodes
  propSchema: PropSchema[];               // Property editor config
}

interface PropSchema {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'boolean' | 'color';
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
}
```

### EditorState

Global application state managed by Zustand.

```typescript
interface EditorState {
  // Tree Data
  nodes: Record<string, ComponentNode>;   // All nodes by ID
  rootIds: string[];                      // Top-level node IDs
  
  // Selection
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  
  // View
  viewMode: 'edit' | 'preview' | 'blueprint';
  zoom: number;
  panOffset: { x: number; y: number };
  
  // Actions
  addNode: (type: ComponentType, parentId?: string, index?: number) => string;
  removeNode: (nodeId: string) => void;
  moveNode: (nodeId: string, newParentId: string | null, index: number) => void;
  updateNodeProps: (nodeId: string, props: Partial<Record<string, unknown>>) => void;
  selectNode: (nodeId: string | null) => void;
  setViewMode: (mode: 'edit' | 'preview' | 'blueprint') => void;
  duplicateNode: (nodeId: string) => string;
  clearCanvas: () => void;
}
```

---

## State Management

### Zustand Store Implementation

```typescript
// src/store/editorStore.ts

import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { ComponentNode, ComponentType, EditorState } from '@/types';
import { componentRegistry } from '@/lib/component-registry';

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: {},
  rootIds: [],
  selectedNodeId: null,
  hoveredNodeId: null,
  viewMode: 'edit',
  zoom: 1,
  panOffset: { x: 0, y: 0 },

  addNode: (type, parentId = null, index) => {
    const id = nanoid(10);
    const registry = componentRegistry[type];
    
    const newNode: ComponentNode = {
      id,
      type,
      props: { ...registry.defaultProps },
      children: [],
      parentId,
    };

    set((state) => {
      const nodes = { ...state.nodes, [id]: newNode };
      
      if (parentId) {
        const parent = { ...state.nodes[parentId] };
        const children = [...parent.children];
        const insertIndex = index ?? children.length;
        children.splice(insertIndex, 0, id);
        parent.children = children;
        nodes[parentId] = parent;
        return { nodes };
      }
      
      const rootIds = [...state.rootIds];
      const insertIndex = index ?? rootIds.length;
      rootIds.splice(insertIndex, 0, id);
      return { nodes, rootIds };
    });

    return id;
  },

  removeNode: (nodeId) => {
    set((state) => {
      const node = state.nodes[nodeId];
      if (!node) return state;

      // Recursively collect all descendant IDs
      const idsToRemove = new Set<string>();
      const collectIds = (id: string) => {
        idsToRemove.add(id);
        state.nodes[id]?.children.forEach(collectIds);
      };
      collectIds(nodeId);

      // Create new nodes object without removed nodes
      const nodes = { ...state.nodes };
      idsToRemove.forEach((id) => delete nodes[id]);

      // Remove from parent or rootIds
      if (node.parentId) {
        const parent = { ...nodes[node.parentId] };
        parent.children = parent.children.filter((id) => id !== nodeId);
        nodes[node.parentId] = parent;
      }

      const rootIds = state.rootIds.filter((id) => id !== nodeId);
      const selectedNodeId = idsToRemove.has(state.selectedNodeId ?? '') 
        ? null 
        : state.selectedNodeId;

      return { nodes, rootIds, selectedNodeId };
    });
  },

  moveNode: (nodeId, newParentId, index) => {
    set((state) => {
      const node = state.nodes[nodeId];
      if (!node) return state;

      const nodes = { ...state.nodes };
      
      // Remove from old location
      if (node.parentId) {
        const oldParent = { ...nodes[node.parentId] };
        oldParent.children = oldParent.children.filter((id) => id !== nodeId);
        nodes[node.parentId] = oldParent;
      }
      
      let rootIds = state.rootIds.filter((id) => id !== nodeId);

      // Add to new location
      const updatedNode = { ...node, parentId: newParentId };
      nodes[nodeId] = updatedNode;

      if (newParentId) {
        const newParent = { ...nodes[newParentId] };
        const children = [...newParent.children];
        children.splice(index, 0, nodeId);
        newParent.children = children;
        nodes[newParentId] = newParent;
      } else {
        rootIds = [...rootIds];
        rootIds.splice(index, 0, nodeId);
      }

      return { nodes, rootIds };
    });
  },

  updateNodeProps: (nodeId, props) => {
    set((state) => {
      const node = state.nodes[nodeId];
      if (!node) return state;

      return {
        nodes: {
          ...state.nodes,
          [nodeId]: {
            ...node,
            props: { ...node.props, ...props },
          },
        },
      };
    });
  },

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  
  setViewMode: (viewMode) => set({ viewMode }),
  
  duplicateNode: (nodeId) => {
    const state = get();
    const node = state.nodes[nodeId];
    if (!node) return '';

    const duplicateRecursive = (originalId: string, newParentId: string | null): string => {
      const original = state.nodes[originalId];
      const newId = nanoid(10);
      
      const newNode: ComponentNode = {
        id: newId,
        type: original.type,
        props: { ...original.props },
        children: [],
        parentId: newParentId,
      };

      set((s) => ({ nodes: { ...s.nodes, [newId]: newNode } }));

      original.children.forEach((childId) => {
        const newChildId = duplicateRecursive(childId, newId);
        set((s) => ({
          nodes: {
            ...s.nodes,
            [newId]: {
              ...s.nodes[newId],
              children: [...s.nodes[newId].children, newChildId],
            },
          },
        }));
      });

      return newId;
    };

    const newId = duplicateRecursive(nodeId, node.parentId);
    
    // Insert after original
    set((s) => {
      if (node.parentId) {
        const parent = { ...s.nodes[node.parentId] };
        const index = parent.children.indexOf(nodeId);
        parent.children = [
          ...parent.children.slice(0, index + 1),
          newId,
          ...parent.children.slice(index + 1),
        ];
        return { nodes: { ...s.nodes, [node.parentId]: parent } };
      }
      const index = s.rootIds.indexOf(nodeId);
      return {
        rootIds: [
          ...s.rootIds.slice(0, index + 1),
          newId,
          ...s.rootIds.slice(index + 1),
        ],
      };
    });

    return newId;
  },

  clearCanvas: () => set({ nodes: {}, rootIds: [], selectedNodeId: null }),
}));
```

---

## File Structure

```
src/
├── components/
│   ├── builder/
│   │   ├── Canvas.tsx              # Main drop zone & render frame
│   │   ├── RecursiveRenderer.tsx   # Tree traversal renderer
│   │   ├── SelectionOverlay.tsx    # Visual selection indicators
│   │   ├── DragOverlay.tsx         # Ghost preview during drag
│   │   ├── SidebarLeft.tsx         # Component palette & layers
│   │   ├── SidebarRight.tsx        # Property editor panel
│   │   ├── ComponentPalette.tsx    # Draggable component items
│   │   ├── LayerTree.tsx           # Hierarchical node navigator
│   │   ├── PropertyEditor.tsx      # Dynamic prop input forms
│   │   ├── BlueprintModal.tsx      # Markdown preview dialog
│   │   └── Header.tsx              # Top bar with actions
│   │
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── accordion.tsx
│   │   └── ...
│   │
│   └── canvas-components/          # Components rendered ON canvas
│       ├── CanvasButton.tsx
│       ├── CanvasCard.tsx
│       ├── CanvasContainer.tsx
│       ├── CanvasHeader.tsx
│       ├── CanvasInput.tsx
│       ├── CanvasText.tsx
│       ├── CanvasImage.tsx
│       ├── CanvasDivider.tsx
│       ├── CanvasColumns.tsx
│       └── CanvasGrid.tsx
│
├── lib/
│   ├── component-registry.tsx      # Type → Component mapping
│   ├── blueprint-generator.ts      # Tree → Markdown serializer
│   ├── dnd-utils.ts               # Drag-and-drop helpers
│   └── utils.ts                   # cn(), general utilities
│
├── store/
│   └── editorStore.ts             # Zustand state management
│
├── hooks/
│   ├── useKeyboardShortcuts.ts    # Hotkey bindings
│   ├── useCanvasInteraction.ts    # Pan, zoom, selection
│   └── useClipboard.ts            # Copy/paste logic
│
├── types/
│   └── index.ts                   # TypeScript interfaces
│
├── pages/
│   └── HomePage.tsx               # Main application entry
│
└── styles/
    └── globals.css                # Tailwind + custom styles
```

---

## Component Specifications

### SidebarLeft.tsx

The left sidebar containing the component library and layer tree.

```typescript
interface SidebarLeftProps {
  className?: string;
}

// Features:
// - Accordion sections: "Components", "Layers", "Settings"
// - Components section: Grid of DraggableSource items
// - Layers section: LayerTree component
// - Settings section: Canvas settings (grid, snap, zoom)

// Draggable items emit:
// - type: ComponentType
// - Creates DragOverlay with component preview
```

**Visual Behavior:**
- Width: `w-64` (256px)
- Background: `bg-slate-900/80 backdrop-blur-md`
- Border: `border-r border-white/10`
- Scrollable content area

### SidebarRight.tsx

Context-aware property editor panel.

```typescript
interface SidebarRightProps {
  className?: string;
}

// Features:
// - Shows "No selection" state when nothing selected
// - Dynamically renders inputs based on propSchema
// - Real-time updates via updateNodeProps action
// - Component type header with icon
// - Delete/Duplicate action buttons
```

**Input Types:**

| Schema Type | Rendered Component |
|-------------|-------------------|
| `text` | `<Input />` |
| `select` | `<Select />` with options |
| `number` | `<Input type="number" />` |
| `boolean` | `<Switch />` |
| `color` | Color picker or preset buttons |

### Canvas.tsx

The central workspace where components are rendered.

```typescript
interface CanvasProps {
  className?: string;
}

// Features:
// - DndContext provider from @dnd-kit/core
// - Droppable zone for root-level drops
// - Renders RecursiveRenderer for each rootId
// - Click-to-deselect on background
// - Pan & zoom support (future phase)
```

**Visual Elements:**
- Dotted grid background pattern
- "Render Frame" with device-width simulation
- Drop indicators during drag operations

### RecursiveRenderer.tsx

Traverses the component tree and renders nodes.

```typescript
interface RecursiveRendererProps {
  nodeId: string;
  depth?: number;
}

// Features:
// - Looks up node from store by ID
// - Retrieves component from registry
// - Wraps in SelectableWrapper for edit mode
// - Recursively renders children
// - Memoized to prevent unnecessary re-renders
```

```typescript
// Example implementation
const RecursiveRenderer = memo(({ nodeId, depth = 0 }: RecursiveRendererProps) => {
  const node = useEditorStore((state) => state.nodes[nodeId]);
  const viewMode = useEditorStore((state) => state.viewMode);
  
  if (!node) return null;
  
  const registry = componentRegistry[node.type];
  const Component = registry.component;
  
  const children = node.children.map((childId) => (
    <RecursiveRenderer key={childId} nodeId={childId} depth={depth + 1} />
  ));
  
  const element = <Component {...node.props}>{children}</Component>;
  
  if (viewMode === 'preview') return element;
  
  return (
    <SelectableWrapper nodeId={nodeId} depth={depth}>
      {element}
    </SelectableWrapper>
  );
});
```

### BlueprintModal.tsx

Displays the generated markdown blueprint.

```typescript
interface BlueprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Features:
// - Calls generateBlueprint() on open
// - Syntax-highlighted markdown preview
// - Copy to clipboard button
// - Download as .md file button
// - Raw/Preview toggle
```

---

## User Flows

### Flow 1: Add Component to Canvas

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User hovers component in Left Sidebar                    │
│    → Component highlights with bg-white/10                  │
├─────────────────────────────────────────────────────────────┤
│ 2. User starts dragging                                     │
│    → DragOverlay appears with semi-transparent preview      │
│    → Cursor changes to grabbing                             │
├─────────────────────────────────────────────────────────────┤
│ 3. User drags over Canvas                                   │
│    → Drop zones highlight with dashed border                │
│    → Insert indicators show placement position              │
├─────────────────────────────────────────────────────────────┤
│ 4. User drops component                                     │
│    → addNode() called with type and parent info             │
│    → Component renders in tree                              │
│    → New node auto-selected                                 │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: Edit Component Properties

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks component on Canvas                          │
│    → Selection overlay appears (blue ring + corner handles) │
│    → selectedNodeId updates in store                        │
├─────────────────────────────────────────────────────────────┤
│ 2. Right Sidebar populates                                  │
│    → Component type header with icon                        │
│    → Property inputs render based on propSchema             │
├─────────────────────────────────────────────────────────────┤
│ 3. User modifies a property (e.g., button text)             │
│    → Input onChange triggers updateNodeProps()              │
│    → Component re-renders with new props                    │
│    → Changes visible immediately on Canvas                  │
└─────────────────────────────────────────────────────────────┘
```

### Flow 3: Generate Blueprint

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Generate Blueprint" in Header               │
│    → BlueprintModal opens                                   │
├─────────────────────────────────────────────────────────────┤
│ 2. generateBlueprint() traverses tree                       │
│    → Serializes each node to markdown format                │
│    → Preserves hierarchy with indentation                   │
├─────────────────────────────────────────────────────────────┤
│ 3. User views generated markdown                            │
│    → Can toggle between raw and rendered preview            │
│    → Can copy to clipboard                                  │
│    → Can download as blueprint.md                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Core Engine & Visuals

**Objective:** Establish the visual foundation and basic interactivity.

**Deliverables:**

| File | Description |
|------|-------------|
| `HomePage.tsx` | IDE layout shell with 3-column structure |
| `editorStore.ts` | Zustand store with core actions |
| `Canvas.tsx` | DndContext + droppable zone |
| `RecursiveRenderer.tsx` | Tree traversal rendering |
| `SidebarLeft.tsx` | Component palette with draggables |
| `component-registry.tsx` | 4 basic components (Container, Text, Button, Card) |

**Acceptance Criteria:**
- [ ] Three-column layout renders correctly
- [ ] Can drag components from sidebar
- [ ] Components render on canvas
- [ ] Click to select works
- [ ] Basic glassmorphism styling applied

### Phase 2: Property Editors & Blueprint Generation

**Objective:** Enable component customization and blueprint export.

**Deliverables:**

| File | Description |
|------|-------------|
| `SidebarRight.tsx` | Property panel with dynamic inputs |
| `PropertyEditor.tsx` | Form field components |
| `BlueprintModal.tsx` | Markdown preview dialog |
| `blueprint-generator.ts` | Tree → markdown serializer |

**Acceptance Criteria:**
- [ ] Selecting a component shows its properties
- [ ] Editing properties updates canvas in real-time
- [ ] Generate Blueprint produces valid markdown
- [ ] Can copy/download blueprint

### Phase 3: Advanced Components & Polish

**Objective:** Expand capabilities and refine user experience.

**Deliverables:**

| Feature | Description |
|---------|-------------|
| Layout components | Columns, Grid, Divider |
| Image component | URL input + preview |
| Header component | Various sizes |
| Layer Tree | Visual hierarchy navigator |
| Keyboard shortcuts | Delete, Duplicate, Undo |
| Drag feedback | Improved ghost, drop indicators |
| Animations | Transitions for all interactions |

**Acceptance Criteria:**
- [ ] All 10 component types functional
- [ ] Nested layouts work correctly
- [ ] Layer tree reflects component hierarchy
- [ ] All keyboard shortcuts functional
- [ ] Smooth animations throughout

---

## Pitfalls & Considerations

### 1. Event Bubbling in Editor

**Problem:** Clicking a `<Button>` component triggers both selection AND the button's onClick.

**Solution:**
```typescript
// In SelectableWrapper
const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  e.preventDefault();
  selectNode(nodeId);
};
```

### 2. Invalid Drop Targets

**Problem:** Dropping a Container inside a Button (which doesn't accept children).

**Solution:**
```typescript
// In drop handler
const canDrop = (dragType: ComponentType, targetId: string): boolean => {
  const target = nodes[targetId];
  if (!target) return true; // Root drop always allowed
  
  const registry = componentRegistry[target.type];
  return registry.acceptsChildren;
};
```

### 3. Recursive Rendering Loops

**Problem:** If a component's parentId points to itself or a descendant.

**Solution:**
```typescript
// Validate before setting parentId
const isDescendant = (nodeId: string, potentialParentId: string): boolean => {
  let current = potentialParentId;
  while (current) {
    if (current === nodeId) return true;
    current = nodes[current]?.parentId;
  }
  return false;
};
```

### 4. Style Isolation

**Problem:** Editor UI styles bleeding into canvas preview components.

**Solutions:**
- Use distinct class prefixes (`aetheria-editor-*` vs `aetheria-canvas-*`)
- Consider iframe for true isolation (Phase 3+)
- Use Tailwind's `@layer` for specificity control

### 5. Performance with Large Trees

**Problem:** Re-rendering entire tree on any state change.

**Solutions:**
```typescript
// Use granular selectors
const node = useEditorStore(
  useCallback((state) => state.nodes[nodeId], [nodeId])
);

// Memoize RecursiveRenderer
const RecursiveRenderer = memo(/* ... */, (prev, next) => {
  return prev.nodeId === next.nodeId;
});
```

### 6. Undo/Redo Complexity

**Problem:** Tree operations are complex to reverse.

**Solution (Phase 3):**
```typescript
// Use Zustand's temporal middleware
import { temporal } from 'zundo';

const useEditorStore = create(
  temporal(
    (set, get) => ({ /* store */ }),
    { limit: 50 }
  )
);
```

---

## API Reference

### Blueprint Generator Output Format

The blueprint generator produces markdown matching this schema:

```markdown
# Component Tree

## Container
- **ID:** `abc123`
- **Props:**
  - padding: `4`
  - background: `slate-800`

### Button
- **ID:** `def456`
- **Props:**
  - label: `Get Started`
  - variant: `default`
  - size: `lg`

### Text
- **ID:** `ghi789`
- **Props:**
  - content: `Welcome to Aetheria`
  - size: `2xl`
  - weight: `bold`
```

### Store Actions Reference

| Action | Parameters | Description |
|--------|------------|-------------|
| `addNode` | `(type, parentId?, index?)` | Creates new node, returns ID |
| `removeNode` | `(nodeId)` | Deletes node and all descendants |
| `moveNode` | `(nodeId, newParentId, index)` | Moves node in tree |
| `updateNodeProps` | `(nodeId, props)` | Merges props into node |
| `selectNode` | `(nodeId \| null)` | Sets selected node |
| `duplicateNode` | `(nodeId)` | Deep copies node, returns new ID |
| `clearCanvas` | `()` | Removes all nodes |
| `setViewMode` | `(mode)` | Switches edit/preview/blueprint |

### Keyboard Shortcuts (Phase 3)

| Key | Action |
|-----|--------|
| `Delete` / `Backspace` | Remove selected node |
| `Cmd/Ctrl + D` | Duplicate selected node |
| `Cmd/Ctrl + C` | Copy selected node |
| `Cmd/Ctrl + V` | Paste copied node |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Escape` | Deselect |
| `P` | Toggle preview mode |

---

## Appendix: Component Registry Reference

```typescript
// src/lib/component-registry.tsx

import {
  Box, Type, MousePointer, CreditCard,
  TextCursor, Image, Minus, Columns, Grid,
  Heading
} from 'lucide-react';

export const componentRegistry: Record<ComponentType, RegistryEntry> = {
  CONTAINER: {
    type: 'CONTAINER',
    label: 'Container',
    icon: Box,
    component: CanvasContainer,
    acceptsChildren: true,
    defaultProps: {
      padding: 4,
      gap: 2,
      direction: 'column',
      background: 'transparent',
    },
    propSchema: [
      { key: 'padding', label: 'Padding', type: 'number' },
      { key: 'gap', label: 'Gap', type: 'number' },
      { 
        key: 'direction', 
        label: 'Direction', 
        type: 'select',
        options: [
          { label: 'Column', value: 'column' },
          { label: 'Row', value: 'row' },
        ]
      },
      { key: 'background', label: 'Background', type: 'color' },
    ],
  },
  
  BUTTON: {
    type: 'BUTTON',
    label: 'Button',
    icon: MousePointer,
    component: CanvasButton,
    acceptsChildren: false,
    defaultProps: {
      label: 'Button',
      variant: 'default',
      size: 'default',
    },
    propSchema: [
      { key: 'label', label: 'Label', type: 'text' },
      {
        key: 'variant',
        label: 'Variant',
        type: 'select',
        options: [
          { label: 'Default', value: 'default' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
          { label: 'Ghost', value: 'ghost' },
          { label: 'Destructive', value: 'destructive' },
        ],
      },
      {
        key: 'size',
        label: 'Size',
        type: 'select',
        options: [
          { label: 'Small', value: 'sm' },
          { label: 'Default', value: 'default' },
          { label: 'Large', value: 'lg' },
        ],
      },
    ],
  },
  
  // ... Additional components follow same pattern
};
```

---

*Last Updated: December 2024*  
*Version: 1.0.0*
