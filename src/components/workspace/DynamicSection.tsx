/**
 * DynamicSection
 * Collapsible section within a panel
 * Supports meta-edit mode for visual customization
 */

import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/store/workspace-store';
import { useMetaEdit, MetaEditWrapper } from '@/contexts/MetaEditContext';
import { Section, ComponentGroup } from '@/types/workspace';
import { 
  ChevronDown, 
  ChevronRight, 
  GripVertical, 
  Plus, 
  Trash2, 
  Pencil,
  Box,
  Square,
  MousePointer,
  Type,
  AlignLeft,
  FormInput,
  Layers,
  Settings,
  Sparkles,
  Folder,
} from 'lucide-react';
import { useBuilderStore, ComponentType } from '@/store/builder-store';

// ============================================
// ICON MAP
// ============================================

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Box,
  Square,
  MousePointer,
  Type,
  AlignLeft,
  FormInput,
  Layers,
  Settings,
  Sparkles,
  Folder,
  Plus,
  GripVertical,
};

const getIcon = (iconName: string) => {
  return ICON_MAP[iconName] || Folder;
};

// ============================================
// PROPS INTERFACE
// ============================================

interface DynamicSectionProps {
  section: Section;
  panelId: string;
  className?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const DynamicSection: React.FC<DynamicSectionProps> = ({
  section,
  panelId,
  className = '',
}) => {
  const toggleSectionCollapse = useWorkspaceStore((s) => s.toggleSectionCollapse);
  const updateSection = useWorkspaceStore((s) => s.updateSection);
  const deleteSection = useWorkspaceStore((s) => s.deleteSection);
  const toggleComponentGroupCollapse = useWorkspaceStore((s) => s.toggleComponentGroupCollapse);
  const { isMetaEditMode, selectElement, isSelected } = useMetaEdit();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(section.title);
  
  const Icon = getIcon(section.icon);
  const selected = isSelected(section.id);
  
  // Handle title edit
  const handleTitleDoubleClick = () => {
    if (isMetaEditMode && section.editable) {
      setIsEditing(true);
      setEditTitle(section.title);
    }
  };
  
  const handleTitleSave = () => {
    if (editTitle.trim()) {
      updateSection(section.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(section.title);
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (section.deletable) {
      deleteSection(section.id);
    }
  };

  return (
    <MetaEditWrapper
      elementId={section.id}
      elementType="section"
      className={cn('relative', className)}
    >
      <div className="border-b border-border/50 last:border-b-0">
        {/* Section Header */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 cursor-pointer',
            'hover:bg-accent/50 transition-colors',
            section.collapsed ? 'bg-transparent' : 'bg-muted/20'
          )}
          onClick={() => toggleSectionCollapse(section.id)}
        >
          {/* Drag handle (meta-edit mode only) */}
          {isMetaEditMode && (
            <div 
              className="cursor-grab active:cursor-grabbing p-0.5 -ml-1"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-3 h-3 text-muted-foreground/40" />
            </div>
          )}
          
          {/* Collapse icon */}
          <div className="flex-shrink-0">
            {section.collapsed ? (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
          
          {/* Section icon */}
          <div className="flex-shrink-0 p-1 rounded bg-muted/50">
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          
          {/* Title (editable in meta mode) */}
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-1 py-0.5 text-sm font-medium bg-background border border-primary rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          ) : (
            <span 
              className="flex-1 text-sm font-medium text-foreground/90 truncate"
              onDoubleClick={handleTitleDoubleClick}
            >
              {section.title}
            </span>
          )}
          
          {/* Actions (meta-edit mode only) */}
          {isMetaEditMode && (
            <div className="flex items-center gap-1">
              {section.editable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setEditTitle(section.title);
                  }}
                  className="p-1 hover:bg-accent rounded transition-colors"
                  title="Edit title"
                >
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
              {section.deletable && (
                <button
                  onClick={handleDelete}
                  className="p-1 hover:bg-destructive/20 rounded transition-colors"
                  title="Delete section"
                >
                  <Trash2 className="w-3 h-3 text-destructive/70" />
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Section Content */}
        {!section.collapsed && (
          <div className="px-2 py-2">
            {section.type === 'component-palette' && section.content?.componentGroups && (
              <ComponentPalette 
                groups={section.content.componentGroups}
                sectionId={section.id}
              />
            )}
            
            {section.type === 'layer-tree' && (
              <LayerTreePlaceholder />
            )}
            
            {section.type === 'properties' && (
              <PropertiesPlaceholder />
            )}
            
            {section.type === 'ai-prompt' && (
              <AIPromptPlaceholder />
            )}
            
            {section.type === 'custom' && section.content?.customContent && (
              <div className="text-sm text-muted-foreground">
                {/* Custom content would be rendered here */}
                Custom content
              </div>
            )}
          </div>
        )}
      </div>
    </MetaEditWrapper>
  );
};

// ============================================
// COMPONENT PALETTE (for component-palette sections)
// ============================================

interface ComponentPaletteProps {
  groups: ComponentGroup[];
  sectionId: string;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ groups, sectionId }) => {
  const addComponent = useBuilderStore((s) => s.addComponent);
  const toggleComponentGroupCollapse = useWorkspaceStore((s) => s.toggleComponentGroupCollapse);
  const { isMetaEditMode } = useMetaEdit();
  
  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.id}>
          {/* Group Header */}
          <button
            onClick={() => toggleComponentGroupCollapse(group.id)}
            className="flex items-center gap-2 w-full text-left px-1 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
          >
            {group.collapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            {group.title}
          </button>
          
          {/* Group Components */}
          {!group.collapsed && (
            <div className="space-y-1 mt-1">
              {group.components.map((comp) => {
                const CompIcon = getIcon(comp.icon);
                return (
                  <button
                    key={comp.id}
                    onClick={() => addComponent(comp.type)}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg',
                      'bg-card/50 border border-border/50',
                      'hover:bg-accent hover:border-accent-foreground/20',
                      'transition-all duration-150',
                      'group'
                    )}
                  >
                    {/* Drag indicator */}
                    <div className="flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3 h-3 text-muted-foreground/50" />
                    </div>
                    
                    {/* Component icon */}
                    <div className="flex-shrink-0 p-1.5 rounded bg-muted/50 group-hover:bg-primary/10">
                      <CompIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    
                    {/* Component name */}
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">
                      {comp.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ============================================
// PLACEHOLDER COMPONENTS
// ============================================

const LayerTreePlaceholder: React.FC = () => (
  <div className="text-sm text-muted-foreground/60 text-center py-4">
    <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
    <p>Layer tree will be rendered here</p>
    <p className="text-xs mt-1">Connect to existing LayerTree component</p>
  </div>
);

const PropertiesPlaceholder: React.FC = () => (
  <div className="text-sm text-muted-foreground/60 text-center py-4">
    <Settings className="w-8 h-8 mx-auto mb-2 opacity-30" />
    <p>Properties panel will be rendered here</p>
    <p className="text-xs mt-1">Connect to existing PropertiesPanel component</p>
  </div>
);

const AIPromptPlaceholder: React.FC = () => (
  <div className="text-sm text-muted-foreground/60 text-center py-4">
    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
    <p>AI prompt interface</p>
    <p className="text-xs mt-1">Connect to existing AI modal</p>
  </div>
);

export default DynamicSection;
