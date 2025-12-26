import React from 'react';
import { RetroDiffusionComponentType, RD_COMPONENT_INFO } from '@/store/layout-store';
import {
  GenerationMode,
  MODE_INFO,
  RDModel,
  MODEL_INFO,
  TilesetStyle,
  CharacterStyle,
  TilesetConfig,
  CharacterConfig,
  StylePreset,
} from '@/types/diffusion';
import { ChevronUp, ChevronDown, Camera, Brush, Image, Plus, X, Sparkles, Zap, Crown, Star } from 'lucide-react';

// ============================================
// SHARED PROPS INTERFACE
// ============================================
export interface RDComponentProps {
  // State
  mode: GenerationMode;
  model: RDModel;
  prompt: string;
  currentStyle: string;
  activePresets: StylePreset[];
  tilesetConfig: TilesetConfig;
  characterConfig: CharacterConfig;
  artStylesExpanded: boolean;
  inputImageExpanded: boolean;
  referenceImages: string[];
  imageCount: number;
  generatedImage: string | null;
  isGenerating: boolean;
  error: string | null;
  history: Array<{ url: string; prompt: string; timestamp: number }>;
  isEditMode: boolean;
  
  // Callbacks
  onModeChange: (mode: GenerationMode) => void;
  onModelChange: (model: RDModel) => void;
  onPromptChange: (prompt: string) => void;
  onStyleChange: (style: string) => void;
  onArtStylesExpandedChange: (expanded: boolean) => void;
  onInputImageExpandedChange: (expanded: boolean) => void;
  onReferenceImagesChange: (images: string[]) => void;
  onImageCountChange: (count: number) => void;
  onGenerate: () => void;
  onDownload: () => void;
  onHistoryClear: () => void;
  onHistoryItemClick: (url: string) => void;
  onEditModeToggle: () => void;
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
export function RDModelSelector({ model, mode, onModelChange, onModeChange }: {
  model: RDModel;
  mode: GenerationMode;
  onModelChange: (model: RDModel) => void;
  onModeChange: (mode: GenerationMode) => void;
}) {
  const models: { model: RDModel; icon: React.ReactNode; badge?: string }[] = [
    { model: RDModel.FAST, icon: <Zap className="w-4 h-4" /> },
    { model: RDModel.PLUS, icon: <Star className="w-4 h-4" /> },
    { model: RDModel.PRO, icon: <Crown className="w-4 h-4" />, badge: 'NEW' },
  ];

  const modes: { mode: GenerationMode; icon: React.ReactNode; badge?: string }[] = [
    { mode: GenerationMode.CHARACTER, icon: <span>🐥</span> },
    { mode: GenerationMode.ANIMATION, icon: <span>🎬</span> },
    { mode: GenerationMode.TILESET, icon: <span>🗺️</span>, badge: 'NEW' },
  ];

  return (
    <div className="space-y-3">
      <div className="mb-3">
        <SectionHeader title="Model" />
      </div>
      {/* Models Row */}
      <div className="grid grid-cols-3 gap-2">
        {models.map(({ model: m, icon, badge }) => {
          const info = MODEL_INFO[m];
          const isSelected = model === m;
          return (
            <button
              key={m}
              onClick={() => onModelChange(m)}
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
        {modes.map(({ mode: m, icon, badge }) => {
          const info = MODE_INFO[m];
          const isSelected = mode === m;
          return (
            <button
              key={m}
              onClick={() => onModeChange(m)}
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
        {MODEL_INFO[model].description}
      </p>
    </div>
  );
}

// ============================================
// ART STYLE SELECTOR COMPONENT
// ============================================
export function RDArtStyleSelector({
  currentStyle,
  presets,
  onStyleChange,
  expanded,
  onExpandedChange,
}: {
  currentStyle: string;
  presets: StylePreset[];
  onStyleChange: (style: string) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const currentPreset = presets.find((p) => p.apiStyle === currentStyle);

  return (
    <div>
      <button
        onClick={() => onExpandedChange(!expanded)}
        className="w-full flex items-center gap-2 py-2 text-white transition-colors group"
      >
        <div className="p-1 rounded bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
          <Brush className="w-4 h-4" />
        </div>
        <div className="flex-1 text-left">
          <SectionHeader title="Art Styles" />
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Style Grid */}
          <div className="grid grid-cols-4 gap-2">
            {presets.slice(0, 16).map((preset) => {
              const isSelected = preset.apiStyle === currentStyle;
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
      )}
    </div>
  );
}

// ============================================
// PROMPT EDITOR COMPONENT
// ============================================
export function RDPromptEditor({
  prompt,
  onPromptChange,
}: {
  prompt: string;
  onPromptChange: (prompt: string) => void;
}) {
  return (
    <div>
      <div className="mb-3">
        <SectionHeader title="Prompt" />
      </div>
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Example: A raven standing on a branch with appalachian forests and mountains in the background"
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
  );
}

// ============================================
// REFERENCE IMAGES COMPONENT
// ============================================
export function RDReferenceImages({
  referenceImages,
  onReferenceImagesChange,
  expanded,
  onExpandedChange,
}: {
  referenceImages: string[];
  onReferenceImagesChange: (images: string[]) => void;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  return (
    <div>
      <button
        onClick={() => onExpandedChange(!expanded)}
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
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
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
                onClick={() => onReferenceImagesChange(referenceImages.filter((_, i) => i !== idx))}
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
                      onReferenceImagesChange([...referenceImages, reader.result as string]);
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
  );
}

// ============================================
// IMAGE COUNT COMPONENT
// ============================================
export function RDImageCount({
  imageCount,
  onImageCountChange,
}: {
  imageCount: number;
  onImageCountChange: (count: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-sm font-medium text-zinc-400">Image Count</span>
      <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-700">
        <button 
          onClick={() => onImageCountChange(Math.max(1, imageCount - 1))}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          -
        </button>
        <span className="w-8 text-center text-sm font-bold text-white">{imageCount}</span>
        <button 
          onClick={() => onImageCountChange(Math.min(4, imageCount + 1))}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

// ============================================
// GENERATE BUTTON COMPONENT
// ============================================
export function RDGenerateButton({
  isGenerating,
  disabled,
  onGenerate,
}: {
  isGenerating: boolean;
  disabled: boolean;
  onGenerate: () => void;
}) {
  return (
    <div className="pt-2">
      <button
        onClick={onGenerate}
        disabled={isGenerating || disabled}
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
  );
}

// ============================================
// IMAGE CANVAS COMPONENT
// ============================================
export function RDImageCanvas({
  generatedImage,
  isGenerating,
  error,
  mode,
  onDownload,
}: {
  generatedImage: string | null;
  isGenerating: boolean;
  error: string | null;
  mode: GenerationMode;
  onDownload: () => void;
}) {
  return (
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
  );
}

// ============================================
// HISTORY PANEL COMPONENT
// ============================================
export function RDHistoryPanel({
  history,
  onHistoryClear,
  onHistoryItemClick,
}: {
  history: Array<{ url: string; prompt: string; timestamp: number }>;
  onHistoryClear: () => void;
  onHistoryItemClick: (url: string) => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white">History</h3>
        <button
          className="text-xs text-zinc-500 hover:text-white transition-colors"
          onClick={onHistoryClear}
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
              onClick={() => onHistoryItemClick(item.url)}
            >
              <div className="aspect-square bg-zinc-950 relative overflow-hidden">
                <img
                  src={item.url}
                  alt="History"
                  className="w-full h-full object-contain"
                  style={{ imageRendering: 'pixelated' }}
                />
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
    </div>
  );
}

// ============================================
// COMPONENT REGISTRY
// ============================================
export function renderRDComponent(
  type: RetroDiffusionComponentType,
  props: RDComponentProps
): React.ReactNode {
  switch (type) {
    case 'RD_MODEL_SELECTOR':
      return (
        <RDModelSelector
          model={props.model}
          mode={props.mode}
          onModelChange={props.onModelChange}
          onModeChange={props.onModeChange}
        />
      );
    case 'RD_ART_STYLE_SELECTOR':
      return (
        <RDArtStyleSelector
          currentStyle={props.currentStyle}
          presets={props.activePresets}
          onStyleChange={props.onStyleChange}
          expanded={props.artStylesExpanded}
          onExpandedChange={props.onArtStylesExpandedChange}
        />
      );
    case 'RD_PROMPT_EDITOR':
      return (
        <RDPromptEditor
          prompt={props.prompt}
          onPromptChange={props.onPromptChange}
        />
      );
    case 'RD_REFERENCE_IMAGES':
      return (
        <RDReferenceImages
          referenceImages={props.referenceImages}
          onReferenceImagesChange={props.onReferenceImagesChange}
          expanded={props.inputImageExpanded}
          onExpandedChange={props.onInputImageExpandedChange}
        />
      );
    case 'RD_IMAGE_COUNT':
      return (
        <RDImageCount
          imageCount={props.imageCount}
          onImageCountChange={props.onImageCountChange}
        />
      );
    case 'RD_GENERATE_BUTTON':
      return (
        <RDGenerateButton
          isGenerating={props.isGenerating}
          disabled={!props.prompt.trim()}
          onGenerate={props.onGenerate}
        />
      );
    case 'RD_IMAGE_CANVAS':
      return (
        <RDImageCanvas
          generatedImage={props.generatedImage}
          isGenerating={props.isGenerating}
          error={props.error}
          mode={props.mode}
          onDownload={props.onDownload}
        />
      );
    case 'RD_HISTORY_PANEL':
      return (
        <RDHistoryPanel
          history={props.history}
          onHistoryClear={props.onHistoryClear}
          onHistoryItemClick={props.onHistoryItemClick}
        />
      );
    case 'RD_HEADER':
    case 'RD_FOOTER':
      // These are handled separately in the layout
      return null;
    default:
      return (
        <div className="p-4 text-red-500 text-sm">
          Unknown component: {type}
        </div>
      );
  }
}
