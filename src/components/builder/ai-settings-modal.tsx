import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  getApiKey, saveApiKey, removeApiKey, isEnvApiKey,
  getAIProvider, setAIProvider, getOllamaSettings, setOllamaSettings,
  getSystemPrompt, setSystemPrompt, resetSystemPrompt, DEFAULT_SYSTEM_PROMPT,
  AIProvider, fetchOllamaModels, OllamaModel,
  getGeminiApiKey, saveGeminiApiKey, removeGeminiApiKey, isEnvGeminiApiKey,
  getGeminiSettings, setGeminiSettings, GEMINI_MODELS,
  isEnhancedPromptMode, setEnhancedPromptMode, getAvailablePresets
} from '@/lib/ai-service';
import { Key, Check, Trash2, ExternalLink, Lock, Bot, FileCode, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface AISettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISettingsModal({ open, onOpenChange }: AISettingsModalProps) {
  const [provider, setProvider] = useState<AIProvider>('claude');
  
  // Claude State
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isFromEnv, setIsFromEnv] = useState(false);
  
  // Ollama State
  const [ollamaEndpoint, setOllamaEndpoint] = useState('/ollama');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Gemini State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.0-flash');
  const [isGeminiConfigured, setIsGeminiConfigured] = useState(false);
  const [isGeminiFromEnv, setIsGeminiFromEnv] = useState(false);

  // System Prompt State
  const [systemPrompt, setSystemPromptState] = useState('');
  const [useEnhancedPrompt, setUseEnhancedPrompt] = useState(false);

  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await fetchOllamaModels();
      setOllamaModels(models);
    } catch (error) {
      console.error('Failed to load models', error);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    if (open) {
      // Load Provider
      const currentProvider = getAIProvider();
      setProvider(currentProvider);

      // Load Claude Settings
      const existingKey = getApiKey();
      const fromEnv = isEnvApiKey();
      setIsConfigured(!!existingKey);
      setIsFromEnv(fromEnv);
      setApiKey(fromEnv ? '' : (existingKey || ''));

      // Load Ollama Settings
      const ollamaSettings = getOllamaSettings();
      setOllamaEndpoint(ollamaSettings.endpoint);
      setOllamaModel(ollamaSettings.model);

      // Load Gemini Settings
      const existingGeminiKey = getGeminiApiKey();
      const geminiFromEnv = isEnvGeminiApiKey();
      setIsGeminiConfigured(!!existingGeminiKey);
      setIsGeminiFromEnv(geminiFromEnv);
      setGeminiApiKey(geminiFromEnv ? '' : (existingGeminiKey || ''));
      const geminiSettings = getGeminiSettings();
      setGeminiModel(geminiSettings.model);

      // Load System Prompt
      setSystemPromptState(getSystemPrompt());
      setUseEnhancedPrompt(isEnhancedPromptMode());
      
      if (currentProvider === 'ollama') {
        loadModels();
      }
    }
  }, [open]);

  // Reload models when switching to Ollama tab
  useEffect(() => {
    if (provider === 'ollama' && open) {
      loadModels();
    }
  }, [provider, open]);

  const handleSave = () => {
    // Save Provider
    setAIProvider(provider);

    // Save System Prompt
    setSystemPrompt(systemPrompt);

    if (provider === 'claude') {
      if (!isFromEnv) {
        if (!apiKey.trim()) {
          toast.error('Please enter an API key');
          return;
        }
        
        if (!apiKey.startsWith('sk-ant-')) {
          toast.error('Invalid API key format. Claude API keys start with "sk-ant-"');
          return;
        }

        saveApiKey(apiKey.trim());
        setIsConfigured(true);
      }
    } else if (provider === 'gemini') {
      if (!isGeminiFromEnv) {
        if (!geminiApiKey.trim()) {
          toast.error('Please enter a Gemini API key');
          return;
        }

        saveGeminiApiKey(geminiApiKey.trim());
        setIsGeminiConfigured(true);
      }
      setGeminiSettings({ model: geminiModel });
    } else if (provider === 'ollama') {
      // Save Ollama Settings
      if (!ollamaEndpoint.trim()) {
        toast.error('Please enter an Ollama endpoint');
        return;
      }
      if (!ollamaModel.trim()) {
        toast.error('Please enter a model name');
        return;
      }
      
      setOllamaSettings({
        endpoint: ollamaEndpoint.trim(),
        model: ollamaModel.trim()
      });
    }

    toast.success('AI settings saved successfully');
    onOpenChange(false);
  };

  const handleRemoveKey = () => {
    removeApiKey();
    setApiKey('');
    if (isEnvApiKey()) {
      setIsConfigured(true);
      setIsFromEnv(true);
      toast.success('Browser key removed. Using environment variable.');
    } else {
      setIsConfigured(false);
      setIsFromEnv(false);
      toast.success('API key removed');
    }
  };

  const handleRemoveGeminiKey = () => {
    removeGeminiApiKey();
    setGeminiApiKey('');
    if (isEnvGeminiApiKey()) {
      setIsGeminiConfigured(true);
      setIsGeminiFromEnv(true);
      toast.success('Browser key removed. Using environment variable.');
    } else {
      setIsGeminiConfigured(false);
      setIsGeminiFromEnv(false);
      toast.success('Gemini API key removed');
    }
  };

  const currentKey = getApiKey();
  const maskedKey = currentKey ? `${currentKey.slice(0, 10)}${'•'.repeat(20)}${currentKey.slice(-4)}` : '';
  
  const currentGeminiKey = getGeminiApiKey();
  const maskedGeminiKey = currentGeminiKey ? `${currentGeminiKey.slice(0, 6)}${'•'.repeat(20)}${currentGeminiKey.slice(-4)}` : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Settings
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider settings.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={provider} onValueChange={(v) => setProvider(v as AIProvider)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="claude">Claude</TabsTrigger>
            <TabsTrigger value="gemini">Gemini</TabsTrigger>
            <TabsTrigger value="ollama">Ollama</TabsTrigger>
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
          </TabsList>
          
          <TabsContent value="claude" className="space-y-4 py-4">
            {isFromEnv && isConfigured ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Lock className="h-4 w-4" />
                  <span>API key configured via environment variable</span>
                </div>
                <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                  {maskedKey}
                </div>
                <p className="text-xs text-muted-foreground">
                  Set in <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> as <code className="bg-muted px-1 py-0.5 rounded">VITE_CLAUDE_API_KEY</code>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="sk-ant-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  {isConfigured && (
                    <Button variant="destructive" size="icon" onClick={handleRemoveKey}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally in your browser.
                </p>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <a href="https://console.anthropic.com/" target="_blank" rel="noreferrer" className="hover:underline">
                Get an API key from Anthropic
              </a>
            </div>
          </TabsContent>

          <TabsContent value="gemini" className="space-y-4 py-4">
            {isGeminiFromEnv && isGeminiConfigured ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Lock className="h-4 w-4" />
                  <span>API key configured via environment variable</span>
                </div>
                <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                  {maskedGeminiKey}
                </div>
                <p className="text-xs text-muted-foreground">
                  Set in <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> as <code className="bg-muted px-1 py-0.5 rounded">VITE_GEMINI_API_KEY</code>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="geminiApiKey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="geminiApiKey"
                    type="password"
                    placeholder="AIza..."
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                  />
                  {isGeminiConfigured && (
                    <Button variant="destructive" size="icon" onClick={handleRemoveGeminiKey}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally in your browser.
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="geminiModel">Model</Label>
              <Select onValueChange={setGeminiModel} value={geminiModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {GEMINI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        <span>{model.name}</span>
                        {model.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500 text-white rounded">
                            {model.badge}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {GEMINI_MODELS.find(m => m.id === geminiModel) && (
                <p className="text-xs text-muted-foreground">
                  {GEMINI_MODELS.find(m => m.id === geminiModel)?.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ExternalLink className="h-3 w-3" />
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="hover:underline">
                Get an API key from Google AI Studio
              </a>
            </div>
          </TabsContent>

          <TabsContent value="ollama" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                placeholder="/ollama"
                value={ollamaEndpoint}
                onChange={(e) => setOllamaEndpoint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use <code className="bg-muted px-1 rounded">/ollama</code> to proxy requests (avoids CORS issues).
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Model Name</Label>
              <div className="flex gap-2">
                <Input
                  id="model"
                  placeholder="llama3"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  className="flex-1"
                />
                <Select onValueChange={setOllamaModel} value={ollamaModel}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {ollamaModels.length > 0 ? (
                      ollamaModels.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.name}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="llama3">Llama 3</SelectItem>
                        <SelectItem value="mistral">Mistral</SelectItem>
                        <SelectItem value="codellama">CodeLlama</SelectItem>
                        <SelectItem value="glm4">GLM-4</SelectItem>
                        <SelectItem value="qwen2">Qwen 2</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={loadModels} 
                  disabled={isLoadingModels}
                  title="Refresh Models"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingModels ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter manually or select a detected model from your local Ollama instance.
              </p>
            </div>

            <div className="bg-muted/50 p-3 rounded-md text-xs text-muted-foreground">
              <p className="font-medium mb-1">Note:</p>
              <p>Ensure Ollama is running and accessible. You may need to configure CORS if running in a browser environment.</p>
              <p className="mt-1">Run: <code className="bg-muted px-1 rounded">OLLAMA_ORIGINS="*" ollama serve</code></p>
            </div>
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4 py-4">
            {/* Enhanced Mode Toggle */}
            <div className="p-4 border rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  <Label htmlFor="enhanced-mode" className="font-semibold">Enhanced Pro Mode</Label>
                </div>
                <Switch
                  id="enhanced-mode"
                  checked={useEnhancedPrompt}
                  onCheckedChange={(checked) => {
                    setUseEnhancedPrompt(checked);
                    setEnhancedPromptMode(checked);
                    if (checked) {
                      toast.success('Enhanced Pro Mode activated! AI will generate polished, professional designs.');
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enable professional design intelligence with style presets, page templates, and polished components. 
                Creates Dribbble/Awwwards-quality designs.
              </p>
              
              {useEnhancedPrompt && (
                <div className="mt-3 pt-3 border-t border-indigo-500/20">
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">✨ Available Style Presets:</p>
                  <div className="flex flex-wrap gap-1">
                    {getAvailablePresets().map(preset => (
                      <span key={preset.id} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                        {preset.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="systemPrompt">Custom System Instructions</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs"
                  onClick={() => setSystemPromptState(DEFAULT_SYSTEM_PROMPT)}
                  disabled={useEnhancedPrompt}
                >
                  Reset to Default
                </Button>
              </div>
              <Textarea
                id="systemPrompt"
                value={systemPrompt}
                onChange={(e) => setSystemPromptState(e.target.value)}
                className="min-h-[200px] font-mono text-xs"
                placeholder="Enter system instructions..."
                disabled={useEnhancedPrompt}
              />
              {useEnhancedPrompt ? (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  <Zap className="inline h-3 w-3 mr-1" />
                  Custom instructions disabled when Enhanced Mode is active.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  These instructions define how the AI behaves and formats its responses.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
