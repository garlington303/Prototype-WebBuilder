import React, { useState, useCallback, useEffect } from 'react';
import {
  GenerationMode,
  MODE_INFO,
  RDModel,
  MODEL_INFO,
  TilesetStyle,
  TilesetFormat,
  CharacterStyle,
  CharacterView,
  CharacterAction,
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
  StylePreset,
} from '@/types/diffusion';
import { Icons } from '@/components/diffusion/icons';
import { ChevronUp, ChevronDown, Camera, Download, RefreshCw, Sparkles, Settings, Image, Plus, X, Brush, Zap, Crown, Star, Pencil, Eye, Save } from 'lucide-react';
import { DraggableSection } from '@/components/diffusion/DraggableSection';

// ============================================
// HEADER COMPONENT
// ============================================
function Header({ isEditMode, onEditModeToggle }: { isEditMode: boolean; onEditModeToggle: () => void }) {
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
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-bold rounded border border-purple-500/30">
            EDIT MODE
          </span>
        )}
      </div>
      
      <nav className="flex items-center gap-6">
        <a href="/" className="text-sm text-white font-medium hover:text-lime-400 transition-colors">Home</a>
        <a href="#gallery" className="text-sm text-zinc-400 hover:text-white transition-colors">Gallery</a>
        <a href="#tools" className="text-sm text-zinc-400 hover:text-white transition-colors">Developer Tools</a>
        <a href="#affiliate" className="text-sm text-zinc-400 hover:text-white transition-colors">Affiliate</a>
        
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
// SECTION HEADER COMPONENT
// ============================================
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-0.5 h-4 bg-lime-400 rounded-full" />
      <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
    </div>
  );
}

// ============================================
// MODEL SELECTOR COMPONENT
// ============================================
function ModelSelector({
  selectedModel,
  onModelChange,
  selectedMode,
  onModeChange,
}: {
  selectedModel: RDModel;
  onModelChange: (model: RDModel) => void;
  selectedMode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}) {
  const models: { model: RDModel; icon: React.ReactNode; badge?: string }[] = [
    { model: RDModel.FAST, icon: <Zap className="w-4 h-4" /> },
    { model: RDModel.PLUS, icon: <Star className="w-4 h-4" />, badge: undefined },
    { model: RDModel.PRO, icon: <Crown className="w-4 h-4" />, badge: 'NEW' },
  ];

  const modes: { mode: GenerationMode; icon: React.ReactNode; badge?: string }[] = [
    { mode: GenerationMode.CHARACTER, icon: <span>🐥</span> },
    { mode: GenerationMode.ANIMATION, icon: <span>🎬</span> },
    { mode: GenerationMode.TILESET, icon: <span>🗺️</span>, badge: 'NEW' },
  ];

  return (
    <div className="space-y-3">
      {/* Models Row */}
      <div className="grid grid-cols-3 gap-2">
        {models.map(({ model, icon, badge }) => {
          const info = MODEL_INFO[model];
          const isSelected = selectedModel === model;
          return (
            <button
              key={model}
              onClick={() => onModelChange(model)}
              className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-lime-400/10 border-lime-400 text-lime-400'
                  : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {badge && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-purple-600 text-[10px] font-bold text-white rounded">
                  {badge}
                </span>
              )}
              {icon}
              <span className="text-xs font-medium">{info.name}</span>
            </button>
          );
        })}
      </div>

      {/* Modes Row */}
      <div className="grid grid-cols-3 gap-2">
        {modes.map(({ mode, icon, badge }) => {
          const info = MODE_INFO[mode];
          const isSelected = selectedMode === mode;
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`relative flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-lime-400/10 border-lime-400 text-lime-400'
                  : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {badge && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-purple-600 text-[10px] font-bold text-white rounded">
                  {badge}
                </span>
              )}
              <span className="text-lg">{icon}</span>
              <span className="text-xs font-medium">{info.name}</span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <p className="text-xs text-zinc-500 text-center">
        {MODEL_INFO[selectedModel].description}
      </p>
    </div>
  );
}

// ============================================
// ART STYLE SELECTOR COMPONENT
// ============================================
function ArtStyleSelector({
  selectedStyle,
  presets,
  onStyleChange,
}: {
  selectedModel: RDModel;
  selectedStyle: string;
  presets: StylePreset[];
  onStyleChange: (style: string) => void;
}) {
  const currentPreset = presets.find((p) => p.apiStyle === selectedStyle);

  return (
    <div className="space-y-3">
      {/* Style Grid */}
      <div className="grid grid-cols-4 gap-2">
        {presets.slice(0, 16).map((preset) => {
          const isSelected = preset.apiStyle === selectedStyle;
          return (
            <button
              key={preset.id}
              onClick={() => onStyleChange(preset.apiStyle)}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                  : 'bg-zinc-900/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-white'
              }`}
            >
              {preset.isNew && (
                <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-purple-600 text-[8px] font-bold text-white rounded">
                  NEW
                </span>
              )}
              <span className="text-base">{preset.icon}</span>
              <span className="text-[10px] font-medium truncate w-full text-center">
                {preset.shortName || preset.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Style Info */}
      {currentPreset && (
        <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <p className="text-sm font-medium text-purple-400">{currentPreset.name}</p>
          <p className="text-xs text-zinc-500 mt-1">{currentPreset.description}</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================
export function HomePage() {
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

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false);

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
  const currentStyle =
    mode === GenerationMode.TILESET ? tilesetConfig.style : characterConfig.style;

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

  // Handle model selection
  const handleModelSelect = useCallback((newModel: RDModel) => {
    setModel(newModel);
    setMode(GenerationMode.CHARACTER);
  }, []);

  // Handle mode selection
  const handleModeSelect = useCallback((newMode: GenerationMode) => {
    setMode(newMode);
  }, []);

  // Handle generation (mock for now)
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // For demo purposes, generate a placeholder
      const placeholderUrl = `data:image/svg+xml,${encodeURIComponent(`
        <svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
          <rect fill="#1a1a2e" width="256" height="256"/>
          <text x="128" y="128" text-anchor="middle" fill="#a8ff00" font-size="16" font-family="sans-serif">Generated Image</text>
          <text x="128" y="150" text-anchor="middle" fill="#666" font-size="10" font-family="sans-serif">${prompt.slice(0, 30)}...</text>
        </svg>
      `)}`;
      
      setGeneratedImage(placeholderUrl);

      // Add to history
      const entry = { url: placeholderUrl, prompt, timestamp: Date.now() };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, 50);
        persistHistory(next);
        return next;
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt]);

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

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <Header isEditMode={isEditMode} onEditModeToggle={() => setIsEditMode(!isEditMode)} />

      <div className="flex-1 flex max-h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar - Main Controls */}
        <aside className="w-[340px] flex-shrink-0 border-r border-zinc-800 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="p-4 space-y-6 pb-20">
            
            {/* Model Selector */}
            <div>
              <div className="mb-3">
                <SectionHeader title="Model" />
              </div>
              <ModelSelector
                selectedModel={model}
                onModelChange={handleModelSelect}
                selectedMode={mode}
                onModeChange={handleModeSelect}
              />
            </div>

            {/* Art Styles */}
            <div>
              <button
                onClick={() => setArtStylesExpanded(!artStylesExpanded)}
                className="w-full flex items-center gap-2 py-2 text-white transition-colors group"
              >
                <div className="p-1 rounded bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                  <Brush className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <SectionHeader title="Art Styles" />
                </div>
                {artStylesExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {artStylesExpanded && (
                <div className="mt-3">
                  <ArtStyleSelector
                    selectedModel={model}
                    selectedStyle={currentStyle as string}
                    presets={activePresets}
                    onStyleChange={(styleId: string) => {
                      if (mode === GenerationMode.TILESET) {
                        setTilesetConfig((prev) => ({ ...prev, style: styleId as TilesetStyle }));
                      } else {
                        setCharacterConfig((prev) => ({ ...prev, style: styleId as CharacterStyle }));
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div>
              <div className="mb-3">
                <SectionHeader title="Prompt" />
              </div>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Example: A raven standing on a branch with appalachian forests and mountains in the background`}
                  className="w-full h-28 p-3 text-sm bg-zinc-900/50 border border-zinc-700 rounded-xl resize-none text-white placeholder:text-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
                />
                
                {/* Prompt Tools */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <button 
                    disabled={!prompt.trim()}
                    className="p-1.5 text-zinc-500 hover:text-lime-400 bg-black/20 hover:bg-black/40 rounded-lg transition-colors disabled:opacity-50"
                    title="Enhance Prompt"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Reference Images */}
            <div>
              <button
                onClick={() => setInputImageExpanded(!inputImageExpanded)}
                className="w-full flex items-center gap-2 py-2 text-white transition-colors group"
              >
                <div className="p-1 rounded bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                  <Image className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-semibold tracking-wide">
                    Input Image <span className="text-zinc-500 text-xs font-normal">({referenceImages.length}/5)</span>
                  </span>
                </div>
                {inputImageExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {inputImageExpanded && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {referenceImages.map((img, idx) => (
                    <div key={idx} className="relative group w-[60px] h-[60px]">
                      <img
                        src={img}
                        alt={`Ref ${idx}`}
                        className="w-full h-full object-cover rounded-md bg-black/20 border border-zinc-700"
                        style={{ imageRendering: 'pixelated' }}
                      />
                      <button
                        onClick={() => setReferenceImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 p-0.5 bg-black/60 backdrop-blur rounded-full hover:bg-red-500 text-white/70 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {referenceImages.length < 5 && (
                    <label className="flex flex-col items-center justify-center w-[60px] h-[60px] border border-dashed border-zinc-700 rounded-md cursor-pointer hover:border-purple-500 hover:bg-purple-500/5 transition-colors group">
                      <Plus className="w-5 h-5 text-zinc-500 group-hover:text-purple-400" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setReferenceImages(prev => [...prev, reader.result as string]);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Image Count */}
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-medium text-zinc-400">Image Count</span>
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-700">
                <button 
                  onClick={() => setImageCount(Math.max(1, imageCount - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-bold text-white">{imageCount}</span>
                <button 
                  onClick={() => setImageCount(Math.min(4, imageCount + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-between px-6 transition-all"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5" />
                    <span>Generate</span>
                  </div>
                )}
                <span className="bg-black/20 px-3 py-1 rounded text-sm font-mono">$ 0.058</span>
              </button>
            </div>

          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col bg-zinc-900 relative overflow-hidden">
          {/* Toolbar */}
          {generatedImage && (
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
          <div
            className="flex-1 flex items-center justify-center p-8 overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(30,30,40,0.5) 0%, rgba(10,10,12,0.8) 100%)',
            }}
          >
            <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center border border-white/5 rounded-2xl bg-black/20 backdrop-blur-sm shadow-2xl p-1">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-6 animate-pulse">
                  <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-center space-y-2">
                    <p className="text-xl font-medium text-white tracking-wide">Thinking in pixels...</p>
                    <p className="text-sm text-zinc-500">Creating your masterpiece</p>
                  </div>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated pixel art"
                  className="w-full h-full object-contain rounded-xl"
                  style={{
                    imageRendering: 'pixelated',
                    boxShadow: '0 0 50px -10px rgba(0,0,0,0.5)'
                  }}
                />
              ) : (
                <div className="text-center max-w-md p-8">
                  {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  )}
                  <div className="text-8xl mb-6 opacity-20 filter grayscale">{MODE_INFO[mode].icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Start Creating</h3>
                  <p className="text-zinc-500 leading-relaxed">
                    Select a model on the left, choose a style, and describe what you want to create.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar - History */}
        <aside className="w-[280px] flex-shrink-0 border-l border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-white">History</h3>
            <button
              className="text-xs text-zinc-500 hover:text-white transition-colors"
              onClick={() => {
                setHistory([]);
                try { localStorage.removeItem('rd_history'); } catch (e) { /* ignore */ }
              }}
            >
              Clear All
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-10 text-zinc-600 text-xs">
                <div className="text-4xl mb-3 opacity-20">🖼️</div>
                No images generated yet
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all cursor-pointer"
                  onClick={() => setGeneratedImage(item.url)}
                >
                  <div className="aspect-square bg-zinc-950 relative overflow-hidden">
                    <img
                      src={item.url}
                      alt="History"
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button className="p-2 bg-zinc-800 rounded-full hover:bg-purple-600 text-white transition-colors">
                        <RefreshCw className="w-3 h-3" />
                      </button>
                      <button
                        className="p-2 bg-zinc-800 rounded-full hover:bg-lime-500 hover:text-black text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = item.url;
                          link.download = `rd_history_${item.timestamp}.png`;
                          link.click();
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-zinc-400 truncate font-mono" title={item.prompt}>
                      {item.prompt}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
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
  );
}
