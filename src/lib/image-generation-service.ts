/**
 * Image Generation Service for Gemini API
 * Supports:
 * - Gemini 2.5 Flash Image (Nano Banana) - Fast image generation
 * - Imagen 4 - High-fidelity image generation
 */

import { getGeminiApiKey } from './ai-service';

// ============================================
// TYPES
// ============================================

export type ImageGenerationModel = 
  | 'gemini-2.5-flash-image'      // Nano Banana - Fast
  | 'gemini-3-pro-image-preview'  // Nano Banana Pro - Advanced
  | 'imagen-4.0-generate-001'     // Imagen 4 Standard
  | 'imagen-4.0-fast-generate-001' // Imagen 4 Fast
  | 'imagen-4.0-ultra-generate-001'; // Imagen 4 Ultra

export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';

export type ImageSize = '1K' | '2K' | '4K';

export interface ImageGenerationConfig {
  model: ImageGenerationModel;
  prompt: string;
  numberOfImages?: number;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  personGeneration?: 'dont_allow' | 'allow_adult' | 'allow_all';
  negativePrompt?: string;
  referenceImages?: string[]; // Base64 encoded images
  styleModifiers?: string[];
}

export interface GeneratedImage {
  data: string; // Base64 encoded image data
  mimeType: string;
  width?: number;
  height?: number;
}

export interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImage[];
  error?: string;
  promptUsed?: string;
  model?: string;
}

// ============================================
// MODEL INFO
// ============================================

export const IMAGE_GENERATION_MODELS: Array<{
  id: ImageGenerationModel;
  name: string;
  description: string;
  type: 'gemini' | 'imagen';
  supportsSize?: boolean;
  maxImages?: number;
  badge?: string;
}> = [
  {
    id: 'gemini-2.5-flash-image',
    name: 'Nano Banana (Fast)',
    description: 'Fast image generation with Gemini 2.5 Flash',
    type: 'gemini',
    maxImages: 1,
    badge: 'FAST',
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Nano Banana Pro',
    description: 'Advanced generation with 4K support and thinking',
    type: 'gemini',
    supportsSize: true,
    maxImages: 1,
    badge: 'PRO',
  },
  {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4 Standard',
    description: 'High-fidelity image generation',
    type: 'imagen',
    supportsSize: true,
    maxImages: 4,
  },
  {
    id: 'imagen-4.0-fast-generate-001',
    name: 'Imagen 4 Fast',
    description: 'Fast Imagen generation',
    type: 'imagen',
    maxImages: 4,
    badge: 'FAST',
  },
  {
    id: 'imagen-4.0-ultra-generate-001',
    name: 'Imagen 4 Ultra',
    description: 'Highest quality Imagen output',
    type: 'imagen',
    supportsSize: true,
    maxImages: 1,
    badge: 'ULTRA',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getModelInfo(modelId: ImageGenerationModel) {
  return IMAGE_GENERATION_MODELS.find((m) => m.id === modelId);
}

function buildPixelArtPrompt(basePrompt: string, style?: string): string {
  // Enhance prompts for pixel art generation
  const pixelArtModifiers = [
    'pixel art style',
    '16-bit retro game aesthetic',
    'clean pixel edges',
    'limited color palette',
    'sprite art',
  ];

  // Add style modifiers if provided
  if (style) {
    pixelArtModifiers.push(style);
  }

  return `${basePrompt}, ${pixelArtModifiers.join(', ')}`;
}

// ============================================
// GEMINI IMAGE GENERATION (Nano Banana)
// ============================================

async function generateWithGemini(config: ImageGenerationConfig): Promise<ImageGenerationResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      success: false,
      images: [],
      error: 'Gemini API key not configured. Please add your API key in settings.',
    };
  }

  const { model, prompt, aspectRatio, imageSize, referenceImages } = config;

  try {
    // Build request body for generateContent endpoint
    const requestBody: Record<string, unknown> = {
      contents: [
        {
          parts: [
            { text: prompt },
            // Add reference images if provided
            ...(referenceImages || []).map((img) => ({
              inline_data: {
                mime_type: 'image/png',
                data: img.replace(/^data:image\/\w+;base64,/, ''),
              },
            })),
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        ...(model === 'gemini-3-pro-image-preview' && {
          imageConfig: {
            aspectRatio: aspectRatio || '1:1',
            imageSize: imageSize || '1K',
          },
        }),
        ...(model === 'gemini-2.5-flash-image' && aspectRatio && {
          imageConfig: {
            aspectRatio,
          },
        }),
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract images from response
    const images: GeneratedImage[] = [];
    const candidates = data.candidates || [];
    
    for (const candidate of candidates) {
      const content = candidate.content;
      if (!content?.parts) continue;

      for (const part of content.parts) {
        if (part.inlineData) {
          images.push({
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png',
          });
        }
      }
    }

    if (images.length === 0) {
      // Check if there was a text response instead
      const textParts = candidates[0]?.content?.parts?.filter((p: Record<string, unknown>) => p.text);
      if (textParts?.length) {
        return {
          success: false,
          images: [],
          error: `Model returned text instead of image: ${textParts[0].text.slice(0, 200)}`,
        };
      }
      return {
        success: false,
        images: [],
        error: 'No images generated. Try a different prompt.',
      };
    }

    return {
      success: true,
      images,
      promptUsed: prompt,
      model,
    };
  } catch (error) {
    console.error('Gemini image generation error:', error);
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : 'Image generation failed',
    };
  }
}

// ============================================
// IMAGEN GENERATION
// ============================================

async function generateWithImagen(config: ImageGenerationConfig): Promise<ImageGenerationResult> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      success: false,
      images: [],
      error: 'Gemini API key not configured. Please add your API key in settings.',
    };
  }

  const { model, prompt, numberOfImages, aspectRatio, imageSize, personGeneration, negativePrompt } = config;

  try {
    // Imagen uses a different endpoint structure
    const requestBody = {
      instances: [
        {
          prompt,
        },
      ],
      parameters: {
        sampleCount: numberOfImages || 1,
        ...(aspectRatio && { aspectRatio }),
        ...(imageSize && { imageSize }),
        ...(personGeneration && { personGeneration }),
        ...(negativePrompt && { negativePrompt }),
      },
    };

    // Try the generateImages endpoint for Imagen
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Imagen might not be available in all regions
      if (response.status === 404 || response.status === 400) {
        // Fallback to Gemini Nano Banana
        console.warn('Imagen not available, falling back to Gemini 2.5 Flash Image');
        return generateWithGemini({
          ...config,
          model: 'gemini-2.5-flash-image',
        });
      }
      
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract images from Imagen response
    const images: GeneratedImage[] = [];
    const predictions = data.predictions || [];
    
    for (const prediction of predictions) {
      if (prediction.bytesBase64Encoded) {
        images.push({
          data: prediction.bytesBase64Encoded,
          mimeType: prediction.mimeType || 'image/png',
        });
      }
    }

    if (images.length === 0) {
      return {
        success: false,
        images: [],
        error: 'No images generated. Try a different prompt.',
      };
    }

    return {
      success: true,
      images,
      promptUsed: prompt,
      model,
    };
  } catch (error) {
    console.error('Imagen generation error:', error);
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : 'Image generation failed',
    };
  }
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

export async function generateImage(config: ImageGenerationConfig): Promise<ImageGenerationResult> {
  const modelInfo = getModelInfo(config.model);
  
  if (!modelInfo) {
    return {
      success: false,
      images: [],
      error: `Unknown model: ${config.model}`,
    };
  }

  // Apply pixel art enhancements if style modifiers are provided
  let enhancedPrompt = config.prompt;
  if (config.styleModifiers?.length) {
    enhancedPrompt = `${config.prompt}, ${config.styleModifiers.join(', ')}`;
  }

  const enhancedConfig = {
    ...config,
    prompt: enhancedPrompt,
  };

  if (modelInfo.type === 'gemini') {
    return generateWithGemini(enhancedConfig);
  } else {
    return generateWithImagen(enhancedConfig);
  }
}

// ============================================
// UTILITY: Convert base64 to data URL
// ============================================

export function base64ToDataUrl(base64: string, mimeType: string = 'image/png'): string {
  if (base64.startsWith('data:')) {
    return base64;
  }
  return `data:${mimeType};base64,${base64}`;
}

// ============================================
// UTILITY: Download generated image
// ============================================

export function downloadImage(image: GeneratedImage, filename: string = 'generated-image.png'): void {
  const dataUrl = base64ToDataUrl(image.data, image.mimeType);
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================
// PIXEL ART SPECIFIC HELPERS
// ============================================

export const PIXEL_ART_STYLES = [
  { id: 'retro-8bit', name: '8-bit Retro', modifiers: ['8-bit pixel art', 'NES style', 'limited palette'] },
  { id: 'retro-16bit', name: '16-bit Retro', modifiers: ['16-bit pixel art', 'SNES/Genesis style', 'vibrant colors'] },
  { id: 'modern-pixel', name: 'Modern Pixel', modifiers: ['modern pixel art', 'detailed shading', 'clean lines'] },
  { id: 'isometric', name: 'Isometric', modifiers: ['isometric pixel art', '3D perspective', 'detailed'] },
  { id: 'gameboy', name: 'Game Boy', modifiers: ['Game Boy style', 'monochrome green', '4 color palette'] },
  { id: 'commodore64', name: 'Commodore 64', modifiers: ['Commodore 64 style', 'C64 palette', 'retro'] },
] as const;

export function getPixelArtStyleModifiers(styleId: string): string[] {
  const style = PIXEL_ART_STYLES.find((s) => s.id === styleId);
  return style ? [...style.modifiers] : [];
}
