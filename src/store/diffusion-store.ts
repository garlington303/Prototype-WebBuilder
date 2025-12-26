import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GenerationMode,
  RDModel,
  TilesetConfig,
  CharacterConfig,
  DEFAULT_TILESET_CONFIG,
  DEFAULT_CHARACTER_CONFIG,
  TilesetStyle,
  CharacterStyle,
} from '@/types/diffusion';

// ============================================
// DIFFUSION STATE STORE
// Shared state between RetroDiffusion page and Builder
// ============================================

interface HistoryItem {
  url: string;
  prompt: string;
  timestamp: number;
}

interface DiffusionState {
  // Generation Settings
  mode: GenerationMode;
  model: RDModel;
  prompt: string;
  
  // Configs
  tilesetConfig: TilesetConfig;
  characterConfig: CharacterConfig;
  
  // UI State
  artStylesExpanded: boolean;
  inputImageExpanded: boolean;
  settingsExpanded: boolean;
  
  // Generation State
  generatedImage: string | null;
  isGenerating: boolean;
  error: string | null;
  
  // Reference Images
  referenceImages: string[];
  
  // Image Count
  imageCount: number;
  
  // History
  history: HistoryItem[];
  
  // Settings
  width: number;
  height: number;
  seed: string;
  removeBackground: boolean;
  
  // Actions
  setMode: (mode: GenerationMode) => void;
  setModel: (model: RDModel) => void;
  setPrompt: (prompt: string) => void;
  
  setTilesetConfig: (config: Partial<TilesetConfig>) => void;
  setCharacterConfig: (config: Partial<CharacterConfig>) => void;
  setCurrentStyle: (style: string) => void;
  
  setArtStylesExpanded: (expanded: boolean) => void;
  setInputImageExpanded: (expanded: boolean) => void;
  setSettingsExpanded: (expanded: boolean) => void;
  
  setGeneratedImage: (image: string | null) => void;
  setIsGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  
  addReferenceImage: (image: string) => void;
  removeReferenceImage: (index: number) => void;
  clearReferenceImages: () => void;
  
  setImageCount: (count: number) => void;
  
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setSeed: (seed: string) => void;
  setRemoveBackground: (remove: boolean) => void;
  
  // Computed
  getCurrentStyle: () => string;
}

export const useDiffusionStore = create<DiffusionState>()(
  persist(
    (set, get) => ({
      // Initial State
      mode: GenerationMode.CHARACTER,
      model: RDModel.PLUS,
      prompt: '',
      
      tilesetConfig: DEFAULT_TILESET_CONFIG,
      characterConfig: DEFAULT_CHARACTER_CONFIG,
      
      artStylesExpanded: true,
      inputImageExpanded: false,
      settingsExpanded: false,
      
      generatedImage: null,
      isGenerating: false,
      error: null,
      
      referenceImages: [],
      imageCount: 1,
      history: [],
      
      width: 80,
      height: 80,
      seed: '',
      removeBackground: false,
      
      // Actions
      setMode: (mode) => set({ mode }),
      setModel: (model) => set({ model, mode: GenerationMode.CHARACTER }),
      setPrompt: (prompt) => set({ prompt }),
      
      setTilesetConfig: (config) =>
        set((state) => ({
          tilesetConfig: { ...state.tilesetConfig, ...config },
        })),
      
      setCharacterConfig: (config) =>
        set((state) => ({
          characterConfig: { ...state.characterConfig, ...config },
        })),
      
      setCurrentStyle: (style) => {
        const { mode } = get();
        if (mode === GenerationMode.TILESET) {
          set((state) => ({
            tilesetConfig: { ...state.tilesetConfig, style: style as TilesetStyle },
          }));
        } else {
          set((state) => ({
            characterConfig: { ...state.characterConfig, style: style as CharacterStyle },
          }));
        }
      },
      
      setArtStylesExpanded: (expanded) => set({ artStylesExpanded: expanded }),
      setInputImageExpanded: (expanded) => set({ inputImageExpanded: expanded }),
      setSettingsExpanded: (expanded) => set({ settingsExpanded: expanded }),
      
      setGeneratedImage: (image) => set({ generatedImage: image }),
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      setError: (error) => set({ error }),
      
      addReferenceImage: (image) =>
        set((state) => ({
          referenceImages: [...state.referenceImages.slice(0, 4), image],
        })),
      
      removeReferenceImage: (index) =>
        set((state) => ({
          referenceImages: state.referenceImages.filter((_, i) => i !== index),
        })),
      
      clearReferenceImages: () => set({ referenceImages: [] }),
      
      setImageCount: (count) => set({ imageCount: Math.max(1, Math.min(4, count)) }),
      
      addToHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history].slice(0, 50),
        })),
      
      clearHistory: () => set({ history: [] }),
      
      setWidth: (width) => set({ width }),
      setHeight: (height) => set({ height }),
      setSeed: (seed) => set({ seed }),
      setRemoveBackground: (remove) => set({ removeBackground: remove }),
      
      // Computed
      getCurrentStyle: () => {
        const { mode, tilesetConfig, characterConfig } = get();
        return mode === GenerationMode.TILESET
          ? tilesetConfig.style
          : characterConfig.style;
      },
    }),
    {
      name: 'rd-diffusion-storage',
      partialize: (state) => ({
        history: state.history,
        model: state.model,
        mode: state.mode,
        width: state.width,
        height: state.height,
        removeBackground: state.removeBackground,
      }),
    }
  )
);
