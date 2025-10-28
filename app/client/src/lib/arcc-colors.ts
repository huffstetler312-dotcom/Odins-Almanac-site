// ARCC (Adaptive Restaurant Contextual Colorization) System
// Provides intelligent, accessible color mapping for restaurant KPIs

export type ColorSeverity = 'critical' | 'warning' | 'good' | 'excellent';

export interface ARCCColorConfig {
  background: string;
  border: string;
  text: string;
  icon: string;
  variant: 'destructive' | 'secondary' | 'default' | 'outline';
}

// ARCC color mappings optimized for restaurant operations
// Uses WCAG AA compliant colors that work in both light and dark modes
export const arccColorMap: Record<ColorSeverity, ARCCColorConfig> = {
  critical: {
    background: 'bg-destructive/10',
    border: 'border-destructive',
    text: 'text-destructive',
    icon: 'text-destructive',
    variant: 'destructive',
  },
  warning: {
    background: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: 'text-yellow-600 dark:text-yellow-400',
    variant: 'secondary',
  },
  good: {
    background: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'text-blue-600 dark:text-blue-400',
    variant: 'outline',
  },
  excellent: {
    background: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    icon: 'text-green-600 dark:text-green-400',
    variant: 'default',
  },
};

// Get ARCC colors for a specific severity level
export function getARCCColors(severity: ColorSeverity): ARCCColorConfig {
  return arccColorMap[severity];
}

// Get trend indicator colors based on direction and magnitude
export function getTrendColors(direction: 'up' | 'down', severity: ColorSeverity): string {
  const config = getARCCColors(severity);
  
  if (direction === 'up') {
    return severity === 'critical' || severity === 'warning' ? config.icon : 'text-green-600 dark:text-green-400';
  } else {
    return severity === 'excellent' || severity === 'good' ? config.icon : 'text-red-600 dark:text-red-400';
  }
}

// Generate status badge classes based on ARCC severity
export function getStatusBadgeClasses(severity: ColorSeverity): string {
  const config = getARCCColors(severity);
  return `${config.background} ${config.border} ${config.text} border`;
}

// Get icon color classes for severity indicators
export function getIconColorClasses(severity: ColorSeverity): string {
  const config = getARCCColors(severity);
  return config.icon;
}

// Smart color selection for charts based on data context
export function getChartColors(dataType: 'performance' | 'trend' | 'comparison'): string[] {
  switch (dataType) {
    case 'performance':
      return [
        'hsl(var(--chart-1))', // primary blue
        'hsl(var(--chart-2))', // success green
        'hsl(var(--chart-3))', // warning amber
        'hsl(var(--chart-4))', // info purple
        'hsl(var(--chart-5))', // error red
      ];
    case 'trend':
      return [
        'hsl(142 76% 36%)', // green for positive trends
        'hsl(0 84% 60%)',   // red for negative trends
        'hsl(38 92% 50%)',  // amber for neutral/warning
      ];
    case 'comparison':
      return [
        'hsl(219 84% 25%)', // primary
        'hsl(219 60% 75%)', // lighter primary
        'hsl(142 76% 36%)', // success
        'hsl(38 92% 50%)',  // warning
      ];
    default:
      return ['hsl(var(--chart-1))'];
  }
}

// Get contextual descriptions for severity levels
export function getSeverityDescription(severity: ColorSeverity, context: string): string {
  const descriptions = {
    critical: {
      inventory: 'Immediate action required - critical stock levels',
      sales: 'Urgent attention needed - sales significantly below target',
      cost: 'Cost control emergency - margins at risk',
      efficiency: 'Operational issues require immediate intervention',
    },
    warning: {
      inventory: 'Monitor closely - stock levels approaching limits',
      sales: 'Performance concern - below expected targets',
      cost: 'Cost optimization needed - margins declining',
      efficiency: 'Process improvements recommended',
    },
    good: {
      inventory: 'Healthy stock levels - within normal range',
      sales: 'Solid performance - meeting most targets',
      cost: 'Good cost control - margins stable',
      efficiency: 'Operations running smoothly',
    },
    excellent: {
      inventory: 'Optimal stock management - well-balanced levels',
      sales: 'Outstanding performance - exceeding targets',
      cost: 'Excellent cost efficiency - strong margins',
      efficiency: 'Peak operational performance',
    },
  };

  return descriptions[severity][context as keyof typeof descriptions.critical] || 
         `${severity.charAt(0).toUpperCase() + severity.slice(1)} status`;
}