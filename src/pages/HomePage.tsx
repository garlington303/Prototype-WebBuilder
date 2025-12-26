import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  GenerationMode,
  MODE_INFO,
  RDModel,
  MODEL_INFO,
  TilesetConfig,
  CharacterConfig,
  DEFAULT_TILESET_CONFIG,
  DEFAULT_CHARACTER_CONFIG,
  TILESET_PRESETS,
  ITEM_PRESETS,
  RD_FAST_PRESETS,
  RD_MINI_PRESETS,
  RD_PLUS_PRESETS,
  RD_PRO_PRESETS,
  ANIMATION_PRESETS,
} from '@/types/diffusion';
import { Pencil, Eye, Save, RotateCcw, RefreshCw, Download } from 'lucide-react';
import { generateImage, base64ToDataUrl, type ImageGenerationModel } from '@/lib/image-generation-service';

// Layout Store
import { useLayoutStore, ComponentType, COMPONENT_CATALOG, LayoutComponent } from '@/store/layout-store';

// Components
import { SortableSection } from '@/components/diffusion/SortableSection';
import { ComponentToolbox } from '@/components/diffusion/ComponentToolbox';
import { DroppableArea } from '@/components/diffusion/DropZone';
import { renderRDComponent, RDComponentProps } from '@/components/diffusion/rd-component-registry';
import { renderGenericComponent } from '@/components/diffusion/generic-component-registry';

// ============================================
// HEADER COMPONENT
// ============================================
function Header({
  isEditMode,
  onEditModeToggle,
  onResetLayout,
  onSaveLayout,
}: {
  isEditMode: boolean;
  onEditModeToggle: () => void;
  onResetLayout: () => void;
  onSaveLayout: () => void;
}) {
  return (
    <header className={`h-14 flex-shrink-0 border-b bg-zinc-950/90 backdrop-blur-sm flex items-center px-4 justify-between ${isEditMode ? 'border-purple-500/50' : 'border-zinc-800'}`}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-400 to-green-500 flex items-center justify-center text-black font-bold text-sm">
            R
          </div>
          <span className="text-lg font-bold text-white">Retro Diffusion</span>
        </div>
        {isEditMode && (
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-bold rounded border border-purple-500/30 animate-pulse">
            EDIT MODE
          </span>
        )}
      </div>
      
      <nav className="flex items-center gap-6">
        <a href="/" className="text-sm text-white font-medium hover:text-lime-400 transition-colors">Home</a>
        <a href="#gallery" className="text-sm text-zinc-400 hover:text-white transition-colors">Gallery</a>
        <a href="#tools" className="text-sm text-zinc-400 hover:text-white transition-colors">Developer Tools</a>
        <a href="#affiliate" className="text-sm text-zinc-400 hover:text-white transition-colors">Affiliate</a>
        
        {/* Edit Mode Controls */}
        {isEditMode && (
          <>
            <button
              onClick={onResetLayout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 hover:bg-red-500/20 hover:text-red-400 transition-all"
              title="Reset to Default Layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onSaveLayout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-all"
              title="Save Current Layout"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </>
        )}
        
        {/* Edit Mode Toggle */}
        <button
          onClick={onEditModeToggle}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isEditMode
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
          }`}
        >
          {isEditMode ? (
            <>
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </>
          ) : (
            <>
              <Pencil className="w-4 h-4" />
              <span>Edit Layout</span>
            </>
          )}
        </button>
      </nav>
    </header>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================
export function HomePage() {
  // Layout Store
  const {
    components,
    isEditMode,
    setEditMode,
    resetToDefault,
    saveAsPreset,
    addComponent,
    removeComponent,
    updateComponent,
  } = useLayoutStore();

  // Core state
  const [mode, setMode] = useState<GenerationMode>(GenerationMode.CHARACTER);
  const [model, setModel] = useState<RDModel>(RDModel.PLUS);
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artStylesExpanded, setArtStylesExpanded] = useState(true);
  const [inputImageExpanded, setInputImageExpanded] = useState(false);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [imageCount, setImageCount] = useState(1);

  // History state
  const [history, setHistory] = useState<Array<{ url: string; prompt: string; timestamp: number }>>([]);

  // Config state
  const [tilesetConfig, setTilesetConfig] = useState<TilesetConfig>(DEFAULT_TILESET_CONFIG);
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>(DEFAULT_CHARACTER_CONFIG);

  // DnD state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<ComponentType | null>(null);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('rd_history');
      if (raw) {
        const parsed = JSON.parse(raw) as Array<{ url: string; prompt: string; timestamp: number }>;
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch (e) {
      console.warn('Failed to load history', e);
    }
  }, []);

  const persistHistory = (items: Array<{ url: string; prompt: string; timestamp: number }>) => {
    try {
      localStorage.setItem('rd_history', JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist history', e);
    }
  };

  // Get current style
  const currentStyle = mode === GenerationMode.TILESET ? tilesetConfig.style : characterConfig.style;

  // Get active presets based on mode/model
  const getActivePresets = useCallback(() => {
    if (mode === GenerationMode.TILESET) return TILESET_PRESETS;
    if (mode === GenerationMode.ITEM) return ITEM_PRESETS;
    if (mode === GenerationMode.ANIMATION) return ANIMATION_PRESETS;
    
    switch (model) {
      case RDModel.FAST: return RD_FAST_PRESETS;
      case RDModel.PRO: return RD_PRO_PRESETS;
      case RDModel.MINI: return RD_MINI_PRESETS;
      default: return RD_PLUS_PRESETS;
    }
  }, [mode, model]);

  const activePresets = getActivePresets();

  // Handle generation (using Gemini API)
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Map RDModel to image generation model
      const imageModel: ImageGenerationModel = model === RDModel.PRO 
        ? 'gemini-3-pro-image-preview'
        : 'gemini-2.5-flash-image';
      
      // Build enhanced prompt with style modifiers for pixel art
      const styleModifiers: string[] = ['pixel art style', 'retro game aesthetic', 'clean pixel edges'];
      
      if (mode === GenerationMode.TILESET) {
        styleModifiers.push('tileset', 'seamless tile', 'game asset');
      } else if (mode === GenerationMode.CHARACTER) {
        styleModifiers.push('character sprite', 'game character', 'sprite sheet style');
      } else if (mode === GenerationMode.ITEM) {
        styleModifiers.push('game item', 'icon style', 'collectible');
      } else if (mode === GenerationMode.ANIMATION) {
        styleModifiers.push('animation frame', 'sprite animation', 'dynamic pose');
      }
      
      // Add current style to modifiers
      if (currentStyle) {
        styleModifiers.push(String(currentStyle));
      }

      const result = await generateImage({
        model: imageModel,
        prompt: prompt,
        aspectRatio: '1:1',
        styleModifiers,
      });

      if (!result.success) {
        setError(result.error || 'Image generation failed');
        return;
      }

      if (result.images.length === 0) {
        setError('No images were generated. Try a different prompt.');
        return;
      }

      // Convert base64 to data URL for display
      const imageUrl = base64ToDataUrl(result.images[0].data, result.images[0].mimeType);
      setGeneratedImage(imageUrl);

      const entry = { url: imageUrl, prompt, timestamp: Date.now() };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, 50);
        persistHistory(next);
        return next;
      });

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, model, mode, currentStyle]);

  // Handle download
  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `retrodiffusion_${mode}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedImage, mode]);

  // Component props to pass to registry
  const componentProps: RDComponentProps = useMemo(() => ({
    mode,
    model,
    prompt,
    currentStyle: currentStyle as string,
    activePresets,
    tilesetConfig,
    characterConfig,
    artStylesExpanded,
    inputImageExpanded,
    referenceImages,
    imageCount,
    generatedImage,
    isGenerating,
    error,
    history,
    isEditMode,
    onModeChange: setMode,
    onModelChange: (m) => { setModel(m); setMode(GenerationMode.CHARACTER); },
    onPromptChange: setPrompt,
    onStyleChange: (style) => {
      if (mode === GenerationMode.TILESET) {
        setTilesetConfig((prev) => ({ ...prev, style: style as any }));
      } else {
        setCharacterConfig((prev) => ({ ...prev, style: style as any }));
      }
    },
    onArtStylesExpandedChange: setArtStylesExpanded,
    onInputImageExpandedChange: setInputImageExpanded,
    onReferenceImagesChange: setReferenceImages,
    onImageCountChange: setImageCount,
    onGenerate: handleGenerate,
    onDownload: handleDownload,
    onHistoryClear: () => {
      setHistory([]);
      try { localStorage.removeItem('rd_history'); } catch (e) { /* ignore */ }
    },
    onHistoryItemClick: setGeneratedImage,
    onEditModeToggle: () => setEditMode(!isEditMode),
  }), [mode, model, prompt, currentStyle, activePresets, tilesetConfig, characterConfig, artStylesExpanded, inputImageExpanded, referenceImages, imageCount, generatedImage, isGenerating, error, history, isEditMode, handleGenerate, handleDownload, setEditMode]);

  // Get components by section
  const sidebarLeftComponents = useMemo(() => 
    components.filter(c => c.props.section === 'sidebar-left' && c.visible).sort((a, b) => a.position.y - b.position.y),
    [components]
  );

  const mainComponents = useMemo(() =>
    components.filter(c => c.props.section === 'main' && c.visible),
    [components]
  );

  const sidebarRightComponents = useMemo(() =>
    components.filter(c => c.props.section === 'sidebar-right' && c.visible),
    [components]
  );

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    if (active.data.current?.isToolboxItem) {
      setActiveType(active.data.current.type);
    } else {
      const comp = components.find(c => c.id === active.id);
      if (comp) {
        setActiveType(comp.type);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    // Handle toolbox item drop
    if (active.data.current?.isToolboxItem) {
      const type = active.data.current.type as ComponentType;
      const info = COMPONENT_CATALOG[type];
      
      if (!info) return;
      
      // Determine target section from drop zone
      let section = 'sidebar-left';
      if (over.id === 'main-area' || String(over.id).includes('main')) {
        section = 'main';
      } else if (over.id === 'sidebar-right' || String(over.id).includes('right')) {
        section = 'sidebar-right';
      }

      // Add new component
      addComponent({
        type,
        position: { x: 0, y: components.length * 100 },
        size: info.defaultSize || { width: 'auto', height: 'auto' },
        zIndex: 10,
        visible: true,
        locked: false,
        props: { section, ...(info.defaultProps || {}) },
        parentId: null,
      });
      return;
    }

    // Handle reordering
    if (active.id !== over.id) {
      const oldIndex = sidebarLeftComponents.findIndex(c => c.id === active.id);
      const newIndex = sidebarLeftComponents.findIndex(c => c.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Update positions
        const reordered = arrayMove(sidebarLeftComponents, oldIndex, newIndex);
        reordered.forEach((comp, idx) => {
          updateComponent(comp.id, { position: { ...comp.position, y: idx * 100 } });
        });
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Could add visual feedback here
  };

  // Render component by type - routes to correct registry
  const renderComponent = (comp: LayoutComponent) => {
    const info = COMPONENT_CATALOG[comp.type];
    
    if (!info) {
      return <div className="p-4 text-red-500 text-sm">Unknown component: {comp.type}</div>;
    }

    // RetroDiffusion-specific components
    if (info.category === 'retrodiffusion') {
      return renderRDComponent(comp.type as any, componentProps);
    }

    // Generic components (layout, typography, form, media, navigation, data, feedback)
    return renderGenericComponent({
      type: comp.type,
      props: comp.props,
      isEditMode,
    });
  };

  // Get component display info helper
  const getComponentInfo = (type: ComponentType) => {
    return COMPONENT_CATALOG[type] || { name: 'Unknown', icon: '❓' };
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
        <Header
          isEditMode={isEditMode}
          onEditModeToggle={() => setEditMode(!isEditMode)}
          onResetLayout={resetToDefault}
          onSaveLayout={() => {
            const name = window.prompt('Enter preset name:');
            if (name) saveAsPreset(name);
          }}
        />

        <div className="flex-1 flex max-h-[calc(100vh-3.5rem)]">
          {/* Left Sidebar - Main Controls */}
          <DroppableArea
            id="sidebar-left"
            isEditMode={isEditMode}
            label="Left Sidebar"
            emptyMessage="Drop components here"
            className="w-[340px] flex-shrink-0 border-r border-zinc-800 bg-black/40 backdrop-blur-sm overflow-y-auto"
          >
            <div className="p-4 space-y-6 pb-20">
              <SortableContext
                items={sidebarLeftComponents.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {sidebarLeftComponents.map((comp) => (
                  <SortableSection
                    key={comp.id}
                    id={comp.id}
                    label={getComponentInfo(comp.type).name}
                    isEditMode={isEditMode}
                    isLocked={comp.locked}
                    onLockToggle={() => updateComponent(comp.id, { locked: !comp.locked })}
                    onDelete={() => removeComponent(comp.id)}
                  >
                    {renderComponent(comp)}
                  </SortableSection>
                ))}
              </SortableContext>
            </div>
          </DroppableArea>

          {/* Center Canvas */}
          <DroppableArea
            id="main-area"
            isEditMode={isEditMode}
            label="Main Canvas"
            emptyMessage="Drop canvas component here"
            className="flex-1 flex flex-col bg-zinc-900 relative overflow-hidden"
          >
            {/* Toolbar */}
            {generatedImage && !isEditMode && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur rounded-lg border border-white/10 p-1">
                  <button
                    className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Area */}
            {mainComponents.map((comp) => (
              <SortableSection
                key={comp.id}
                id={comp.id}
                label={getComponentInfo(comp.type).name}
                isEditMode={isEditMode}
                isLocked={comp.locked}
                onLockToggle={() => updateComponent(comp.id, { locked: !comp.locked })}
                onDelete={() => removeComponent(comp.id)}
                className="flex-1"
                disabled={!isEditMode}
              >
                {renderComponent(comp)}
              </SortableSection>
            ))}
          </DroppableArea>

          {/* Right Sidebar - History or Toolbox */}
          <aside className="w-[280px] flex-shrink-0 border-l border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden">
            {isEditMode ? (
              <ComponentToolbox />
            ) : (
              sidebarRightComponents.map((comp) => (
                <SortableSection
                  key={comp.id}
                  id={comp.id}
                  label={getComponentInfo(comp.type).name}
                  isEditMode={isEditMode}
                  isLocked={comp.locked}
                  className="flex-1"
                  disabled
                >
                  {renderComponent(comp)}
                </SortableSection>
              ))
            )}
          </aside>
        </div>

        {/* Footer */}
        <footer className="flex-shrink-0 border-t border-zinc-800 bg-zinc-950 py-3 px-4">
          <div className="text-center text-xs text-zinc-600">
            Powered by{' '}
            <a
              href="https://retrodiffusion.ai"
              target="_blank"
              rel="noopener"
              className="text-lime-500 hover:text-lime-400 transition-colors"
            >
              RetroDiffusion API
            </a>
          </div>
        </footer>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeType && (
          <div className="p-4 bg-zinc-900 border border-purple-500 rounded-lg shadow-xl shadow-purple-500/20 opacity-90">
            <div className="flex items-center gap-2 text-white">
              <span className="text-xl">{getComponentInfo(activeType).icon}</span>
              <span className="font-medium">{getComponentInfo(activeType).name}</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
