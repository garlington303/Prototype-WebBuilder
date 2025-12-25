import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuilderStore, ComponentType } from '@/store/builder-store';
import { callAI, AIAction, isAIConfigured, ImageAttachment } from '@/lib/ai-service';
import { Sparkles, Send, Loader2, Settings, AlertCircle, CheckCircle2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { AISettingsModal } from './ai-settings-modal';

interface AIPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: ImageAttachment[];
  actions?: AIAction[];
  status?: 'pending' | 'success' | 'error';
}

export function AIPromptModal({ open, onOpenChange }: AIPromptModalProps) {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [attachedImages, setAttachedImages] = useState<ImageAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

  const components = useBuilderStore((s) => s.components);
  const addComponent = useBuilderStore((s) => s.addComponent);
  const updateComponent = useBuilderStore((s) => s.updateComponent);
  const updateComponentPosition = useBuilderStore((s) => s.updateComponentPosition);
  const removeComponent = useBuilderStore((s) => s.removeComponent);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImageAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only PNG and JPG are allowed.`);
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`File too large: ${file.name}. Maximum size is 10MB.`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newImages.push({
          data: base64,
          mimeType: file.type as 'image/png' | 'image/jpeg',
          name: file.name,
        });
      } catch (error) {
        toast.error(`Failed to read file: ${file.name}`);
      }
    }

    setAttachedImages((prev) => [...prev, ...newImages]);
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const newImages: ImageAttachment[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.type.startsWith('image/')) {
        e.preventDefault(); // Prevent default paste behavior for images
        
        const file = item.getAsFile();
        if (!file) continue;

        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`Invalid image type. Only PNG and JPG are allowed.`);
          continue;
        }

        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(`Pasted image too large. Maximum size is 10MB.`);
          continue;
        }

        try {
          const base64 = await fileToBase64(file);
          newImages.push({
            data: base64,
            mimeType: file.type as 'image/png' | 'image/jpeg',
            name: `pasted-image-${Date.now()}.${file.type === 'image/png' ? 'png' : 'jpg'}`,
          });
          toast.success('Image pasted from clipboard');
        } catch (error) {
          toast.error('Failed to read pasted image');
        }
      }
    }

    if (newImages.length > 0) {
      setAttachedImages((prev) => [...prev, ...newImages]);
    }
  };

  const applyActions = (actions: AIAction[]) => {
    let appliedCount = 0;

    for (const action of actions) {
      try {
        switch (action.type) {
          case 'add':
            if (action.componentType) {
              addComponent(action.componentType, action.position);
              // Update size and props if provided
              // We need to get the newly created component's ID
              // The store auto-selects new components, so we can use that
              setTimeout(() => {
                const state = useBuilderStore.getState();
                const newId = state.selectedId;
                if (newId) {
                  if (action.size) {
                    updateComponentPosition(newId, action.size);
                  }
                  if (action.props) {
                    updateComponent(newId, action.props);
                  }
                }
              }, 10);
              appliedCount++;
            }
            break;

          case 'update':
            if (action.componentId && action.props) {
              updateComponent(action.componentId, action.props);
              appliedCount++;
            }
            break;

          case 'remove':
            if (action.componentId) {
              removeComponent(action.componentId);
              appliedCount++;
            }
            break;

          case 'move':
            if (action.componentId && action.position) {
              updateComponentPosition(action.componentId, action.position);
              appliedCount++;
            }
            break;

          case 'resize':
            if (action.componentId && action.size) {
              updateComponentPosition(action.componentId, action.size);
              appliedCount++;
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to apply action:`, action, error);
      }
    }

    return appliedCount;
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    if (!isAIConfigured()) {
      toast.error('Please configure AI settings first');
      setShowSettings(true);
      return;
    }

    const userMessage: Message = { role: 'user', content: prompt.trim(), images: attachedImages.length > 0 ? [...attachedImages] : undefined };
    setMessages((prev) => [...prev, userMessage]);
    const imagesToSend = [...attachedImages];
    setPrompt('');
    setAttachedImages([]);
    setIsLoading(true);

    try {
      const response = await callAI(prompt.trim(), components, imagesToSend.length > 0 ? imagesToSend : undefined);
      
      const appliedCount = applyActions(response.actions);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.explanation,
        actions: response.actions,
        status: 'success',
      };
      setMessages((prev) => [...prev, assistantMessage]);

      toast.success(`Applied ${appliedCount} change${appliedCount !== 1 ? 's' : ''}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: errorMessage,
        status: 'error',
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickPrompts = [
    'Add a hero section with a title and CTA button',
    'Create a contact form',
    'Add a navigation header',
    'Create a pricing card',
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl h-[600px] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Design Assistant
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <span>Describe what you want to create or change</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="gap-1 text-xs"
              >
                <Settings className="h-3 w-3" />
                Settings
              </Button>
            </DialogDescription>
          </DialogHeader>

          {/* Messages area */}
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">How can I help you?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try one of these prompts to get started:
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {quickPrompts.map((qp, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setPrompt(qp)}
                      >
                        {qp}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : msg.status === 'error'
                          ? 'bg-destructive/10 text-destructive border border-destructive/20'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === 'assistant' && msg.status === 'error' && (
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        )}
                        {msg.role === 'assistant' && msg.status === 'success' && (
                          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.images && msg.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {msg.images.map((img, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={`data:${img.mimeType};base64,${img.data}`}
                              alt={img.name || 'Attached image'}
                              className="h-16 w-16 object-cover rounded border border-border/50"
                            />
                          ))}
                        </div>
                      )}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
                          {msg.actions.length} action{msg.actions.length !== 1 ? 's' : ''} applied
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="flex-shrink-0 border-t pt-4 space-y-2">
            {/* Image previews */}
            {attachedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
                {attachedImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={`data:${img.mimeType};base64,${img.data}`}
                      alt={img.name || 'Attached'}
                      className="h-16 w-16 object-cover rounded border border-border"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[8px] px-1 truncate rounded-b">
                      {img.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Attach image (PNG, JPG up to 10MB)"
                className="h-[60px] w-[50px] flex-shrink-0"
              >
                <ImagePlus className="h-5 w-5" />
              </Button>
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="Describe what you want to create or change..."
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSubmit}
                disabled={(!prompt.trim() && attachedImages.length === 0) || isLoading}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Press Enter to send, Shift+Enter for new line. Paste or attach images (PNG/JPG, max 10MB)
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <AISettingsModal open={showSettings} onOpenChange={setShowSettings} />
    </>
  );
}
