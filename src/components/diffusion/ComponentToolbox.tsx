import React, { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  RotateCcw, 
  Save, 
  Search, 
  ChevronDown, 
  ChevronRight,
  X,
  Plus,
  Layers,
  Type,
  FormInput,
  Image as ImageIcon,
  Navigation,
  BarChart3,
  MessageSquare,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ComponentType, 
  ComponentCategory,
  COMPONENT_CATALOG,
  CATEGORY_INFO,
  getComponentsByCategory,
  useLayoutStore,
} from '@/store/layout-store';

// ============================================
// CATEGORY ICONS MAP
// ============================================
const CATEGORY_ICONS: Record<ComponentCategory, React.ReactNode> = {
  retrodiffusion: <Palette className="w-4 h-4" />,
  layout: <Layers className="w-4 h-4" />,
  typography: <Type className="w-4 h-4" />,
  form: <FormInput className="w-4 h-4" />,
  media: <ImageIcon className="w-4 h-4" />,
  navigation: <Navigation className="w-4 h-4" />,
  data: <BarChart3 className="w-4 h-4" />,
  feedback: <MessageSquare className="w-4 h-4" />,
};

// ============================================
// DRAGGABLE COMPONENT ITEM
// ============================================
interface ToolboxItemProps {
  type: ComponentType;
  compact?: boolean;
}

function ToolboxItem({ type, compact = false }: ToolboxItemProps) {
  const info = COMPONENT_CATALOG[type];
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `toolbox-${type}`,
    data: {
      type,
      isToolboxItem: true,
      componentInfo: info,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          'flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing',
          'bg-zinc-900/50 border-zinc-700/50 hover:border-purple-500/50 hover:bg-purple-500/10',
          isDragging && 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20',
          info.isContainer && 'border-dashed'
        )}
        title={`${info.name}: ${info.description}`}
      >
        <span className="text-lg mb-1">{info.icon}</span>
        <span className="text-[9px] text-zinc-400 text-center leading-tight truncate w-full">
          {info.name}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing',
        'bg-zinc-900/50 border-zinc-700/50 hover:border-purple-500/50 hover:bg-purple-500/10',
        isDragging && 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20',
        info.isContainer && 'border-dashed'
      )}
    >
      <GripVertical className="w-3 h-3 text-zinc-600 flex-shrink-0" />
      <span className="text-base flex-shrink-0">{info.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-white truncate">{info.name}</p>
        <p className="text-[10px] text-zinc-500 truncate">{info.description}</p>
      </div>
      {info.isContainer && (
        <span className="text-[8px] px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded">
          container
        </span>
      )}
    </div>
  );
}

// ============================================
// CATEGORY SECTION
// ============================================
interface CategorySectionProps {
  category: ComponentCategory;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery: string;
  viewMode: 'grid' | 'list';
}

function CategorySection({ category, isExpanded, onToggle, searchQuery, viewMode }: CategorySectionProps) {
  const info = CATEGORY_INFO[category];
  const components = getComponentsByCategory(category);
  
  // Filter by search
  const filteredComponents = useMemo(() => {
    if (!searchQuery) return components;
    const query = searchQuery.toLowerCase();
    return components.filter((type) => {
      const compInfo = COMPONENT_CATALOG[type];
      return (
        compInfo.name.toLowerCase().includes(query) ||
        compInfo.description.toLowerCase().includes(query) ||
        type.toLowerCase().includes(query)
      );
    });
  }, [components, searchQuery]);

  if (filteredComponents.length === 0) return null;

  return (
    <div className="mb-3">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors group"
      >
        <span className="text-zinc-500 group-hover:text-purple-400 transition-colors">
          {CATEGORY_ICONS[category]}
        </span>
        <span className="flex-1 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          {info.name}
        </span>
        <span className="text-[10px] text-zinc-600 mr-1">
          {filteredComponents.length}
        </span>
        {isExpanded ? (
          <ChevronDown className="w-3 h-3 text-zinc-500" />
        ) : (
          <ChevronRight className="w-3 h-3 text-zinc-500" />
        )}
      </button>

      {/* Components */}
      {isExpanded && (
        <div className={cn(
          'mt-1 pl-2',
          viewMode === 'grid' 
            ? 'grid grid-cols-3 gap-1.5' 
            : 'space-y-1'
        )}>
          {filteredComponents.map((type) => (
            <ToolboxItem key={type} type={type} compact={viewMode === 'grid'} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// QUICK ADD PANEL
// ============================================
function QuickAddPanel() {
  const quickComponents: ComponentType[] = [
    'CONTAINER',
    'FLEX_ROW',
    'HEADING_2',
    'PARAGRAPH',
    'BUTTON',
    'INPUT_TEXT',
    'IMAGE',
    'CARD',
  ];

  return (
    <div className="p-3 border-b border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
          Quick Add
        </span>
        <Plus className="w-3 h-3 text-zinc-500" />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {quickComponents.map((type) => (
          <ToolboxItem key={type} type={type} compact />
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT TOOLBOX
// ============================================
export function ComponentToolbox() {
  const { resetToDefault, saveAsPreset, presets, loadPreset } = useLayoutStore();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCategories, setExpandedCategories] = useState<Set<ComponentCategory>>(
    new Set(['layout', 'typography', 'form'])
  );
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');

  const categories: ComponentCategory[] = [
    'retrodiffusion',
    'layout',
    'typography',
    'form',
    'media',
    'navigation',
    'data',
    'feedback',
  ];

  const toggleCategory = (category: ComponentCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(categories));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      saveAsPreset(presetName.trim());
      setPresetName('');
      setShowSaveModal(false);
    }
  };

  // Count total visible components
  const totalComponents = useMemo(() => {
    if (!searchQuery) return Object.keys(COMPONENT_CATALOG).length;
    const query = searchQuery.toLowerCase();
    return Object.entries(COMPONENT_CATALOG).filter(([type, info]) => 
      info.name.toLowerCase().includes(query) ||
      info.description.toLowerCase().includes(query) ||
      type.toLowerCase().includes(query)
    ).length;
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-950">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            Components
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
              title={viewMode === 'grid' ? 'List view' : 'Grid view'}
            >
              {viewMode === 'grid' ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-8 pr-8 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Expand/Collapse */}
        <div className="flex items-center justify-between mt-2 text-[10px]">
          <span className="text-zinc-500">{totalComponents} components</span>
          <div className="flex gap-2">
            <button onClick={expandAll} className="text-zinc-500 hover:text-purple-400">
              Expand all
            </button>
            <span className="text-zinc-700">|</span>
            <button onClick={collapseAll} className="text-zinc-500 hover:text-purple-400">
              Collapse
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add */}
      {!searchQuery && <QuickAddPanel />}

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto p-3">
        {categories.map((category) => (
          <CategorySection
            key={category}
            category={category}
            isExpanded={expandedCategories.has(category) || !!searchQuery}
            onToggle={() => toggleCategory(category)}
            searchQuery={searchQuery}
            viewMode={viewMode}
          />
        ))}

        {/* No results */}
        {searchQuery && totalComponents === 0 && (
          <div className="text-center py-8 text-zinc-500">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No components found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Layout Actions */}
      <div className="p-3 border-t border-zinc-800 space-y-2 flex-shrink-0">
        {/* Save Modal */}
        {showSaveModal && (
          <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-700 space-y-2 mb-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name..."
              className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="flex-1 px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Presets Dropdown */}
        {presets.length > 0 && (
          <select
            onChange={(e) => e.target.value && loadPreset(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            defaultValue=""
          >
            <option value="" disabled>Load preset...</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
          >
            <Save className="w-3 h-3" />
            <span>Save</span>
          </button>
          <button
            onClick={resetToDefault}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-300 rounded-lg transition-colors"
            title="Reset to Default"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        <p className="text-[9px] text-zinc-600 text-center">
          Drag components into the layout
        </p>
      </div>
    </div>
  );
}
