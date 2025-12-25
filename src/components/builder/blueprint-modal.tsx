import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useBuilderStore } from '@/store/builder-store';
import { generateBlueprint } from '@/lib/blueprint-utils';
import { Copy, Check, FileCode } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
interface BlueprintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function BlueprintModal({ open, onOpenChange }: BlueprintModalProps) {
  const components = useBuilderStore((s) => s.components);
  const [copied, setCopied] = useState(false);
  const blueprint = generateBlueprint(components);
  const handleCopy = () => {
    navigator.clipboard.writeText(blueprint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            Project Blueprint
          </DialogTitle>
          <DialogDescription>
            This is the generated architectural blueprint of your current layout.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 border rounded-md bg-muted/50 relative group">
          <ScrollArea className="h-[400px] w-full p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap text-foreground/80">
              {blueprint}
            </pre>
          </ScrollArea>
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleCopy} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}