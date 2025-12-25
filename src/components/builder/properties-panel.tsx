import React from 'react';
import { useBuilderStore } from '@/store/builder-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Trash2, X, Move, Maximize2, Type } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function PropertiesPanel() {
  const selectedId = useBuilderStore((s) => s.selectedId);
  const components = useBuilderStore((s) => s.components);
  const updateComponent = useBuilderStore((s) => s.updateComponent);
  const updateComponentPosition = useBuilderStore((s) => s.updateComponentPosition);
  const removeComponent = useBuilderStore((s) => s.removeComponent);
  const selectComponent = useBuilderStore((s) => s.selectComponent);

  // Helper to find the selected component in the tree
  const findSelectedComponent = (nodes: any[], id: string): any => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children.length > 0) {
        const found = findSelectedComponent(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedComponent = selectedId ? findSelectedComponent(components, selectedId) : null;

  if (!selectedId || !selectedComponent) {
    return (
      <aside className="w-80 border-l border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col h-full items-center justify-center text-muted-foreground p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">🎯</span>
        </div>
        <p className="text-sm">Select a component on the canvas to edit its properties.</p>
      </aside>
    );
  }

  const handleChange = (key: string, value: any) => {
    updateComponent(selectedId, { [key]: value });
  };

  const handlePositionChange = (key: string, value: number) => {
    updateComponentPosition(selectedId, { [key]: value });
  };

  return (
    <aside className="w-80 border-l border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/10">
        <div>
          <h2 className="font-semibold text-sm">Properties</h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">{selectedComponent.type} • {selectedId.slice(0, 8)}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => selectComponent(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Position & Size */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Move className="h-3 w-3" />
            Position & Size
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">X</Label>
              <Input 
                type="number"
                value={Math.round(selectedComponent.position?.x ?? 0)} 
                onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)} 
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Y</Label>
              <Input 
                type="number"
                value={Math.round(selectedComponent.position?.y ?? 0)} 
                onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)} 
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Width</Label>
              <Input 
                type="number"
                value={Math.round(selectedComponent.position?.width ?? 200)} 
                onChange={(e) => handlePositionChange('width', Math.max(50, parseInt(e.target.value) || 50))} 
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Height</Label>
              <Input 
                type="number"
                value={Math.round(selectedComponent.position?.height ?? 100)} 
                onChange={(e) => handlePositionChange('height', Math.max(30, parseInt(e.target.value) || 30))} 
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Font Size (for text-based components) */}
        {(selectedComponent.type === 'button' || selectedComponent.type === 'header' || selectedComponent.type === 'text' || selectedComponent.type === 'card' || selectedComponent.type === 'input') && (
          <>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Type className="h-3 w-3" />
                Typography
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs">Font Size</Label>
                  <span className="text-xs text-muted-foreground">{selectedComponent.props.fontSize || 16}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="8"
                    max="120"
                    value={selectedComponent.props.fontSize || 16}
                    onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <Input
                    type="number"
                    min="8"
                    max="200"
                    value={selectedComponent.props.fontSize || 16}
                    onChange={(e) => handleChange('fontSize', Math.max(8, Math.min(200, parseInt(e.target.value) || 16)))}
                    className="w-16 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Content Properties */}
        {(['button', 'header', 'text', 'card', 'input', 'container'].includes(selectedComponent.type)) && (
          <>
            <div className="space-y-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Content</h3>
              
              {/* Container Help Text */}
              {selectedComponent.type === 'container' && (
                <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md border border-border/50">
                  <p>This is a layout container.</p>
                  <p className="mt-1">Drag other components (like Text, Buttons, or Cards) inside it to add content.</p>
                </div>
              )}

              {/* Text Content (Children) */}
              {(selectedComponent.type === 'button' || selectedComponent.type === 'header' || selectedComponent.type === 'text') && (
                <div className="space-y-2">
                  <Label>Text</Label>
                  <Input 
                    value={selectedComponent.props.children || ''} 
                    onChange={(e) => handleChange('children', e.target.value)} 
                  />
                </div>
              )}
              {/* Card Specifics */}
              {selectedComponent.type === 'card' && (
                <>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input 
                      value={selectedComponent.props.title || ''} 
                      onChange={(e) => handleChange('title', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                      value={selectedComponent.props.description || ''} 
                      onChange={(e) => handleChange('description', e.target.value)} 
                      className="resize-none h-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Footer</Label>
                    <Input 
                      value={selectedComponent.props.footer || ''} 
                      onChange={(e) => handleChange('footer', e.target.value)} 
                    />
                  </div>
                </>
              )}
              {/* Input Specifics */}
              {selectedComponent.type === 'input' && (
                <>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input 
                      value={selectedComponent.props.label || ''} 
                      onChange={(e) => handleChange('label', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Placeholder</Label>
                    <Input 
                      value={selectedComponent.props.placeholder || ''} 
                      onChange={(e) => handleChange('placeholder', e.target.value)} 
                    />
                  </div>
                </>
              )}
            </div>
            <Separator />
          </>
        )}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Appearance</h3>
          {/* Button Variant */}
          {selectedComponent.type === 'button' && (
            <div className="space-y-2">
              <Label>Variant</Label>
              <Select 
                value={selectedComponent.props.variant || 'default'} 
                onValueChange={(val) => handleChange('variant', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="ghost">Ghost</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Header Level */}
          {selectedComponent.type === 'header' && (
            <div className="space-y-2">
              <Label>Level</Label>
              <Select 
                value={selectedComponent.props.level || 'h2'} 
                onValueChange={(val) => handleChange('level', val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1</SelectItem>
                  <SelectItem value="h2">H2</SelectItem>
                  <SelectItem value="h3">H3</SelectItem>
                  <SelectItem value="h4">H4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Container Layout */}
          {selectedComponent.type === 'container' && (
            <div className="space-y-2">
              <Label>Layout Direction</Label>
              <Select 
                value={selectedComponent.props.layout || 'flex-col'} 
                onValueChange={(val) => {
                  handleChange('layout', val);
                  // Update className to reflect layout
                  const currentClass = selectedComponent.props.className || '';
                  const newClass = currentClass.replace(/flex-row|flex-col/g, '').trim() + ` ${val}`;
                  handleChange('className', newClass);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex-col">Vertical (Column)</SelectItem>
                  <SelectItem value="flex-row">Horizontal (Row)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Custom Classes</Label>
            <Input 
              value={selectedComponent.props.className || ''} 
              onChange={(e) => handleChange('className', e.target.value)} 
              className="font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">Tailwind classes separated by space</p>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border bg-muted/10">
        <Button 
          variant="destructive" 
          className="w-full gap-2" 
          onClick={() => removeComponent(selectedId)}
        >
          <Trash2 className="h-4 w-4" />
          Delete Component
        </Button>
      </div>
    </aside>
  );
}