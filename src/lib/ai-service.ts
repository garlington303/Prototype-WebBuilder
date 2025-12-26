/**
 * AI Service for Claude API integration
 * Handles communication with Claude to interpret user prompts and generate design changes
 */

import { Component, ComponentType } from '@/store/builder-store';
import { ENHANCED_SYSTEM_PROMPT, buildContextualPrompt, ConversationContext, interpretRefinement } from './ai-system-prompt';
import { STYLE_PRESETS, getPresetStyles, getAllPresets, getAllTemplates } from './design-system';

// Types for AI actions
export interface AIAction {
  type: 'add' | 'update' | 'remove' | 'move' | 'resize';
  componentId?: string;
  componentType?: ComponentType;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  props?: Record<string, any>;
}

export interface AIResponse {
  actions: AIAction[];
  explanation: string;
}

export interface ImageAttachment {
  data: string; // base64 encoded
  mimeType: 'image/png' | 'image/jpeg';
  name?: string;
}

export type AIProvider = 'claude' | 'ollama' | 'gemini';

export interface OllamaSettings {
  endpoint: string;
  model: string;
}

export interface GeminiSettings {
  model: string;
}

const DEFAULT_OLLAMA_SETTINGS: OllamaSettings = {
  // Point to our local backend proxy (Express) which forwards to Ollama.
  // This avoids browser CORS and 403 errors when Ollama is configured to restrict origins.
  endpoint: 'http://localhost:5174/ollama',
  model: 'llama3',
};

// Available Gemini models
export const GEMINI_MODELS: Array<{ id: string; name: string; description: string; badge?: string }> = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', description: 'Best for deep logic and complex tasks', badge: 'NEW' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', description: 'Fast, iterative UI changes', badge: 'NEW' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast and efficient' },
  { id: 'gemini-2.0-flash-thinking-exp-1219', name: 'Gemini 2.0 Thinking', description: 'Enhanced reasoning' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Most capable 1.5 model' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Lightweight and fast' },
];

const DEFAULT_GEMINI_SETTINGS: GeminiSettings = {
  model: 'gemini-3-pro-preview',  // Default to Gemini 3 Pro
};

// Default System Prompt
export const DEFAULT_SYSTEM_PROMPT = `You are an expert UI/UX Designer and Frontend Developer acting as the AI engine for a visual web builder.
Your goal is to generate structured JSON actions to build beautiful, functional web layouts based on user requests.

# COMPONENT LIBRARY
You have access to the following components. Use them creatively.

1. **container**
   - A wrapper for grouping items.
   - Props: \`className\` (string), \`layout\` (string - unused, use className).
   - Default: \`flex flex-col\` (Note: Layout is handled via absolute positioning, but styling applies).

2. **card**
   - A structured content box.
   - Props: \`title\` (string), \`description\` (string), \`content\` (string), \`footer\` (string), \`className\` (string).
   - Note: If you add children to a card, they override \`content\`.

3. **button**
   - Interactive element.
   - Props: \`children\` (string - text), \`variant\` ('default'|'destructive'|'outline'|'secondary'|'ghost'|'link'), \`size\` ('default'|'sm'|'lg'|'icon'), \`className\` (string).

4. **header**
   - Typography for headings.
   - Props: \`children\` (string), \`level\` ('h1'|'h2'|'h3'|'h4'), \`className\` (string).

5. **text**
   - Body text.
   - Props: \`children\` (string), \`className\` (string).

6. **input**
   - Form field.
   - Props: \`label\` (string), \`placeholder\` (string), \`type\` (string), \`className\` (string).

# CRITICAL LAYOUT RULES (READ CAREFULLY)
1. **Absolute Positioning**: This builder uses absolute positioning for ALL components.
   - You MUST provide \`position: { x, y }\` and \`size: { width, height }\` for every component.
   - **Children are positioned relative to their parent.** (e.g., x: 10 inside a container means 10px from the container's left edge).
   - You CANNOT rely on CSS flexbox/grid for *positioning* (e.g., \`gap-4\` won't automatically space items). You must manually calculate \`x\` and \`y\` coordinates to create spacing.

2. **Styling with Tailwind**:
   - Use the \`className\` prop to apply Tailwind CSS utility classes for visual styling.
   - **Colors**: \`bg-blue-500\`, \`text-white\`, \`border-gray-200\`, etc.
   - **Typography**: \`font-bold\`, \`text-xl\`, \`text-center\`.
   - **Effects**: \`shadow-md\`, \`rounded-lg\`, \`hover:bg-blue-600\`.
   - **Spacing (Internal)**: \`p-4\` (padding works inside components), \`m-0\`.

3. **Heuristics**:
   - **Containers**: Use them to group related sections (e.g., a "Hero Section" or "Sidebar").
   - **Spacing**: Leave at least 10-20px gap between elements.
   - **Sizes**: Buttons ~40px height. Inputs ~70px height (includes label). Cards ~min 200px height.

# RESPONSE FORMAT
Respond ONLY with a valid JSON object. Do not include markdown formatting or conversational text outside the JSON.

\`\`\`json
{
  "actions": [
    {
      "type": "add", // or "update", "remove", "move", "resize"
      "componentType": "button",
      "parentId": "optional-parent-id", // Omit for root level
      "position": { "x": 0, "y": 0 },
      "size": { "width": 100, "height": 40 },
      "props": {
        "children": "Click Me",
        "className": "bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
      }
    }
  ],
  "explanation": "Brief description of changes."
}
\`\`\`

# EXAMPLES

**User**: "Create a login card centered on the screen."
**Response**:
{
  "actions": [
    {
      "type": "add",
      "componentType": "card",
      "position": { "x": 800, "y": 300 },
      "size": { "width": 400, "height": 350 },
      "props": {
        "title": "Welcome Back",
        "description": "Please sign in to your account",
        "className": "shadow-xl border-t-4 border-blue-500"
      }
    },
    {
      "type": "add",
      "componentType": "input",
      "position": { "x": 820, "y": 420 },
      "size": { "width": 360, "height": 70 },
      "props": { "label": "Email", "placeholder": "user@example.com" }
    },
    {
      "type": "add",
      "componentType": "input",
      "position": { "x": 820, "y": 500 },
      "size": { "width": 360, "height": 70 },
      "props": { "label": "Password", "placeholder": "Enter your password", "type": "password" }
    },
    {
      "type": "add",
      "componentType": "button",
      "position": { "x": 820, "y": 590 },
      "size": { "width": 360, "height": 44 },
      "props": { "children": "Sign In", "variant": "default", "className": "w-full" }
    }
  ],
  "explanation": "Created a centered login card and placed email/password inputs and a sign-in button visually inside it."
}
`;

// Settings Management

// Enhanced prompt mode toggle
export function isEnhancedPromptMode(): boolean {
  return localStorage.getItem('use_enhanced_prompt') === 'true';
}

export function setEnhancedPromptMode(enabled: boolean): void {
  localStorage.setItem('use_enhanced_prompt', enabled ? 'true' : 'false');
}

export function getSystemPrompt(): string {
  // Check if using enhanced prompt mode
  if (isEnhancedPromptMode()) {
    return ENHANCED_SYSTEM_PROMPT;
  }
  return localStorage.getItem('system_prompt') || DEFAULT_SYSTEM_PROMPT;
}

export function getActiveSystemPrompt(): { prompt: string; isEnhanced: boolean } {
  const isEnhanced = isEnhancedPromptMode();
  return {
    prompt: isEnhanced ? ENHANCED_SYSTEM_PROMPT : (localStorage.getItem('system_prompt') || DEFAULT_SYSTEM_PROMPT),
    isEnhanced
  };
}

export function setSystemPrompt(prompt: string): void {
  localStorage.setItem('system_prompt', prompt);
}

export function resetSystemPrompt(): void {
  localStorage.removeItem('system_prompt');
}

// Get design presets and templates for UI
export function getAvailablePresets() {
  return getAllPresets();
}

export function getAvailableTemplates() {
  return getAllTemplates();
}

export function getAIProvider(): AIProvider {
  return (localStorage.getItem('ai_provider') as AIProvider) || 'claude';
}

export function setAIProvider(provider: AIProvider): void {
  localStorage.setItem('ai_provider', provider);
}

export function getOllamaSettings(): OllamaSettings {
  const stored = localStorage.getItem('ollama_settings');
  if (stored) {
    return JSON.parse(stored);
  }
  return DEFAULT_OLLAMA_SETTINGS;
}

export function setOllamaSettings(settings: OllamaSettings): void {
  localStorage.setItem('ollama_settings', JSON.stringify(settings));
}

export function getGeminiSettings(): GeminiSettings {
  const stored = localStorage.getItem('gemini_settings');
  if (stored) {
    return JSON.parse(stored);
  }
  return DEFAULT_GEMINI_SETTINGS;
}

export function setGeminiSettings(settings: GeminiSettings): void {
  localStorage.setItem('gemini_settings', JSON.stringify(settings));
}

// Gemini API key functions
export function getGeminiApiKey(): string | null {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.length > 0) {
    return envKey;
  }
  return localStorage.getItem('gemini_api_key');
}

export function isEnvGeminiApiKey(): boolean {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  return !!envKey && envKey.length > 0;
}

export function saveGeminiApiKey(key: string): void {
  localStorage.setItem('gemini_api_key', key);
}

export function removeGeminiApiKey(): void {
  localStorage.removeItem('gemini_api_key');
}

export function hasGeminiApiKey(): boolean {
  const key = getGeminiApiKey();
  return !!key && key.length > 0;
}

// Get API key - checks env var first, then localStorage
export function getApiKey(): string | null {
  // First check environment variable (set in .env.local)
  const envKey = import.meta.env.VITE_CLAUDE_API_KEY;
  if (envKey && envKey.length > 0) {
    return envKey;
  }
  // Fall back to localStorage
  return localStorage.getItem('claude_api_key');
}

// Check if API key is from environment variable
export function isEnvApiKey(): boolean {
  const envKey = import.meta.env.VITE_CLAUDE_API_KEY;
  return !!envKey && envKey.length > 0;
}

// Save API key to localStorage
export function saveApiKey(key: string): void {
  localStorage.setItem('claude_api_key', key);
}

// Remove API key from localStorage
export function removeApiKey(): void {
  localStorage.removeItem('claude_api_key');
}

// Check if AI is configured (Claude Key, Gemini Key, or Ollama)
export function isAIConfigured(): boolean {
  const provider = getAIProvider();
  if (provider === 'ollama') {
    return true; // Assumed configured as it has defaults
  }
  if (provider === 'gemini') {
    return hasGeminiApiKey();
  }
  return hasApiKey();
}

// Check if API key is configured
export function hasApiKey(): boolean {
  const key = getApiKey();
  return !!key && key.length > 0;
}

// Format current components for context
function formatComponentsContext(components: Component[]): string {
  if (components.length === 0) {
    return 'Canvas is currently empty.';
  }

  const formatComponent = (comp: Component, indent = 0): string => {
    const prefix = '  '.repeat(indent);
    let str = `${prefix}- ${comp.type} (id: "${comp.id}")`;
    str += `\n${prefix}  position: (${comp.position.x}, ${comp.position.y})`;
    str += `\n${prefix}  size: ${comp.position.width}x${comp.position.height}`;
    
    const relevantProps = Object.entries(comp.props)
      .filter(([key]) => !['className'].includes(key))
      .map(([key, val]) => `${key}: "${val}"`)
      .join(', ');
    
    if (relevantProps) {
      str += `\n${prefix}  props: { ${relevantProps} }`;
    }
    
    if (comp.children.length > 0) {
      str += `\n${prefix}  children:`;
      comp.children.forEach(child => {
        str += '\n' + formatComponent(child, indent + 2);
      });
    }
    
    return str;
  };

  return 'Current components on canvas:\n' + components.map(c => formatComponent(c)).join('\n\n');
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[] | null;
    parameter_size: string;
    quantization_level: string;
  };
}

export async function fetchOllamaModels(): Promise<OllamaModel[]> {
  const settings = getOllamaSettings();
  const raw = settings.endpoint || '';
  let endpoint = raw.replace(/\/$/, '');
  // Remove /api/chat if present to get base URL
  endpoint = endpoint.replace(/\/api\/chat$/, '');
  
  const fetchUrl = `${endpoint}/api/tags`;

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      console.warn(`Failed to fetch models: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}

// Call Ollama API
async function callOllamaAPI(
  userPrompt: string,
  currentComponents: Component[],
  images?: ImageAttachment[]
): Promise<AIResponse> {
  const settings = getOllamaSettings();
  const componentsContext = formatComponentsContext(currentComponents);
  const fullPrompt = `${componentsContext}\n\nUser request: ${userPrompt}`;

  try {
    // Normalize endpoint and avoid duplicating /api/chat if user included it
    const raw = settings.endpoint || '';
    let endpoint = raw.replace(/\/$/, '');
    // If user provided the full path including /api/chat, use it as-is
    const endpointHasApiChat = /\/api\/chat$/.test(endpoint);
    const fetchUrl = endpointHasApiChat ? endpoint : `${endpoint}/api/chat`;

    // Build user message with optional images for vision models
    const userMessage: { role: string; content: string; images?: string[] } = {
      role: 'user',
      content: fullPrompt,
    };

    // Add images if provided (Ollama vision format)
    if (images && images.length > 0) {
      userMessage.images = images.map((img) => img.data);
    }

    // Note: Some vision models don't support format: 'json', so we only use it for non-vision requests
    const requestBody: Record<string, unknown> = {
      model: settings.model,
      messages: [
        { role: 'system', content: getSystemPrompt() },
        userMessage
      ],
      stream: false,
    };

    // Only force JSON format when not sending images (vision models often don't support it)
    if (!images || images.length === 0) {
      requestBody.format = 'json';
    }

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.message?.content;

    if (!content) {
      throw new Error('No response content from Ollama');
    }

    try {
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const parsed = JSON.parse(jsonStr.trim());
      
      return {
        actions: parsed.actions || [],
        explanation: parsed.explanation || 'Changes applied.',
      };
    } catch (parseError) {
      console.error('Failed to parse Ollama response:', content);
      throw new Error('Failed to parse AI response. The AI returned invalid JSON.');
    }
  } catch (error) {
    console.error('Ollama API Error:', error);
    throw error;
  }
}

// Main AI entry point
export async function callAI(
  userPrompt: string,
  currentComponents: Component[],
  images?: ImageAttachment[]
): Promise<AIResponse> {
  const provider = getAIProvider();
  
  if (provider === 'ollama') {
    return callOllamaAPI(userPrompt, currentComponents, images);
  }
  
  if (provider === 'gemini') {
    return callGeminiAPI(userPrompt, currentComponents, images);
  }
  
  // Default to Claude
  return callClaudeAPI(userPrompt, currentComponents, images);
}

// Call Gemini API
export async function callGeminiAPI(
  userPrompt: string,
  currentComponents: Component[],
  images?: ImageAttachment[]
): Promise<AIResponse> {
  const apiKey = getGeminiApiKey();
  const settings = getGeminiSettings();
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Please add your API key in settings.');
  }

  const componentsContext = formatComponentsContext(currentComponents);
  const fullPrompt = `${componentsContext}\n\nUser request: ${userPrompt}`;

  // Build parts array for Gemini (supports text and images)
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  // Add images first if provided
  if (images && images.length > 0) {
    for (const img of images) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data,
        },
      });
    }
  }

  // Add the text prompt
  parts.push({
    text: fullPrompt,
  });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts,
            },
          ],
          systemInstruction: {
            parts: [{ text: getSystemPrompt() }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.status} - ${(errorData as any)?.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No response content from Gemini API');
    }

    // Parse the JSON response
    try {
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const parsed = JSON.parse(jsonStr.trim());
      
      return {
        actions: parsed.actions || [],
        explanation: parsed.explanation || 'Changes applied.',
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', content);
      throw new Error('Failed to parse AI response. The AI returned invalid JSON.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with Gemini API');
  }
}

// Call Claude API
export async function callClaudeAPI(
  userPrompt: string,
  currentComponents: Component[],
  images?: ImageAttachment[]
): Promise<AIResponse> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('Claude API key not configured. Please add your API key in settings.');
  }

  const componentsContext = formatComponentsContext(currentComponents);
  const fullPrompt = `${componentsContext}\n\nUser request: ${userPrompt}`;

  // Build content array for Claude (supports text and images)
  const contentParts: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> = [];

  // Add images first if provided
  if (images && images.length > 0) {
    for (const img of images) {
      contentParts.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mimeType,
          data: img.data,
        },
      });
    }
  }

  // Add the text prompt
  contentParts.push({
    type: 'text',
    text: fullPrompt,
  });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: getSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: contentParts,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Claude API error: ${response.status} - ${(errorData as any)?.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content = (data as any).content?.[0]?.text;

    if (!content) {
      throw new Error('No response content from Claude API');
    }

    // Parse the JSON response
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      
      const parsed = JSON.parse(jsonStr.trim());
      
      return {
        actions: parsed.actions || [],
        explanation: parsed.explanation || 'Changes applied.',
      };
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content);
      throw new Error('Failed to parse AI response. The AI returned invalid JSON.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to communicate with Claude API');
  }
}
