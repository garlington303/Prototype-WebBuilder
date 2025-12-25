/**
 * Usage Display Component
 * Shows real-time cost tracking and usage statistics
 */

import React, { useEffect, useState } from 'react';
import { getUsageStats, UsageStats, formatCost, formatTokens, estimateTokens } from '@/lib/db';
import { getAIProvider, getGeminiSettings } from '@/lib/ai-service';
import { Zap, TrendingUp, DollarSign, Activity, Fuel } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ============================================
// INLINE COST DISPLAY (For chat input)
// ============================================

interface InlineCostEstimateProps {
  text: string;
  imageCount: number;
  className?: string;
}

export function InlineCostEstimate({ text, imageCount, className }: InlineCostEstimateProps) {
  const provider = getAIProvider();
  const tokens = estimateTokens(text, provider);
  
  // Rough estimate: images add ~1000 tokens each for vision models
  const imageTokens = imageCount * 1000;
  const totalEstimate = tokens + imageTokens;
  
  // Very rough cost estimate (input only, output unknown)
  const costPer1K = provider === 'claude' ? 0.003 : provider === 'gemini' ? 0.0001 : 0;
  const estimatedInputCost = (totalEstimate / 1000) * costPer1K;
  
  if (tokens === 0 && imageCount === 0) {
    return null;
  }
  
  return (
    <div className={cn('text-xs text-muted-foreground flex items-center gap-2', className)}>
      <span>~{formatTokens(totalEstimate)} tokens</span>
      {costPer1K > 0 && (
        <>
          <span>•</span>
          <span>Est. {formatCost(estimatedInputCost * 3)}</span>
        </>
      )}
    </div>
  );
}

// ============================================
// COMPACT USAGE BADGE (For header)
// ============================================

interface UsageBadgeProps {
  className?: string;
  onClick?: () => void;
}

export function UsageBadge({ className, onClick }: UsageBadgeProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  
  useEffect(() => {
    loadStats();
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadStats = async () => {
    const data = await getUsageStats();
    setStats(data);
  };
  
  if (!stats) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
              'bg-muted/50 hover:bg-muted transition-colors',
              className
            )}
          >
            <DollarSign className="h-3 w-3 text-green-500" />
            <span>{formatCost(stats.thisMonth.cost)}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p>This month: {stats.thisMonth.requests} requests</p>
          <p>Tokens: {formatTokens(stats.thisMonth.tokens)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================
// FUEL GAUGE (Visual usage display)
// ============================================

interface FuelGaugeProps {
  spent: number;
  budget?: number;
  className?: string;
}

export function FuelGauge({ spent, budget = 50, className }: FuelGaugeProps) {
  const percentage = Math.min((spent / budget) * 100, 100);
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;
  
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          <Fuel className={cn(
            'h-4 w-4',
            isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-green-500'
          )} />
          <span className="font-medium">{formatCost(spent)}</span>
          <span className="text-muted-foreground">/ {formatCost(budget)}</span>
        </span>
        <span className={cn(
          'text-xs font-medium',
          isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-muted-foreground'
        )}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <Progress 
        value={percentage} 
        className={cn(
          'h-2',
          isCritical && '[&>div]:bg-red-500',
          isWarning && !isCritical && '[&>div]:bg-yellow-500'
        )}
      />
    </div>
  );
}

// ============================================
// USAGE STATS CARD (For settings/dashboard)
// ============================================

interface UsageStatsCardProps {
  className?: string;
}

export function UsageStatsCard({ className }: UsageStatsCardProps) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    setLoading(true);
    const data = await getUsageStats();
    setStats(data);
    setLoading(false);
  };
  
  if (loading) {
    return (
      <div className={cn('animate-pulse bg-muted rounded-lg p-4', className)}>
        <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-muted-foreground/20 rounded w-1/3"></div>
      </div>
    );
  }
  
  if (!stats) return null;
  
  return (
    <div className={cn('bg-muted/30 rounded-lg p-4 space-y-4', className)}>
      <h3 className="font-semibold flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        Usage This Month
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{formatCost(stats.thisMonth.cost)}</p>
          <p className="text-xs text-muted-foreground">Cost</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{stats.thisMonth.requests}</p>
          <p className="text-xs text-muted-foreground">Requests</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{formatTokens(stats.thisMonth.tokens)}</p>
          <p className="text-xs text-muted-foreground">Tokens</p>
        </div>
      </div>
      
      {/* Provider breakdown */}
      {Object.keys(stats.byProvider).length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">By Provider</p>
          <div className="space-y-1">
            {Object.entries(stats.byProvider).map(([provider, data]) => (
              <div key={provider} className="flex items-center justify-between text-xs">
                <span className="capitalize">{provider}</span>
                <span className="text-muted-foreground">
                  {formatCost(data.cost)} • {data.requests} req
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Today's usage */}
      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Today</span>
          <span>
            {formatCost(stats.today.cost)} • {stats.today.requests} requests
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MESSAGE COST TAG (For individual messages)
// ============================================

interface MessageCostTagProps {
  inputTokens: number;
  outputTokens: number;
  cost: number;
  className?: string;
}

export function MessageCostTag({ inputTokens, outputTokens, cost, className }: MessageCostTagProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px] text-muted-foreground/70',
            className
          )}>
            <Zap className="h-3 w-3" />
            {formatCost(cost)}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>Input: {formatTokens(inputTokens)} tokens</p>
          <p>Output: {formatTokens(outputTokens)} tokens</p>
          <p className="font-medium mt-1">Cost: {formatCost(cost)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
