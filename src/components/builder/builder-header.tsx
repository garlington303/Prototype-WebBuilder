import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useBuilderStore } from '@/store/builder-store';
import { Eye, Edit3, Code, Trash2, Download, Sparkles } from 'lucide-react';
import { BlueprintModal } from './blueprint-modal';
import { AIPromptModal } from './ai-prompt-modal';
import { toast } from 'sonner';

export function BuilderHeader() {
  const mode = useBuilderStore((s) => s.mode);
  const setMode = useBuilderStore((s) => s.setMode);
  const reset = useBuilderStore((s) => s.reset);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const handleReset = () => {
    if (confirm('Are you sure you want to clear the canvas? This cannot be undone.')) {
      reset();
      toast.success('Canvas cleared');
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <h1 className="font-bold text-lg tracking-tight hidden sm:block">
          Aetheria <span className="text-muted-foreground font-normal">Builder</span>
        </h1>
      </div>

      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border">
        <Button
          variant={mode === 'edit' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setMode('edit')}
          className="gap-2 h-8"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant={mode === 'preview' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setMode('preview')}
          className="gap-2 h-8"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </Button>
      </div>

      <div className="flex items-center gap-3">
        {/* AI Assistant Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAIPrompt(true)}
          className="gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 hover:border-purple-500/50 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20"
        >
          <Sparkles className="h-4 w-4 text-purple-500" />
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>

        <Button variant="ghost" size="icon" onClick={handleReset} title="Clear Canvas">
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 hidden sm:flex"
          onClick={() => setShowBlueprint(true)}
        >
          <Code className="h-4 w-4" />
          Blueprint
        </Button>
        <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <div className="ml-2 pl-2 border-l border-border">
          <ThemeToggle className="static" />
        </div>
      </div>

      <BlueprintModal open={showBlueprint} onOpenChange={setShowBlueprint} />
      <AIPromptModal open={showAIPrompt} onOpenChange={setShowAIPrompt} />
    </header>
  );
}