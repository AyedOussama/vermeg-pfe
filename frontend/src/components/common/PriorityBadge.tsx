// ============================================================================
// PRIORITY & IMPACT BADGES - Attractive badges for job priorities and impact
// ============================================================================

import React from 'react';
import { cn } from '@/utils/cn';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'small' | 'medium' | 'large';
  variant?: 'solid' | 'outlined' | 'gradient' | 'glass';
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

interface ImpactBadgeProps {
  impact: ImpactLevel;
  size?: 'small' | 'medium' | 'large';
  variant?: 'solid' | 'outlined' | 'gradient' | 'glass';
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

// Priority Badge Component
export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'medium',
  variant = 'glass',
  showIcon = true,
  pulse = false,
  className = ''
}) => {
  const priorityConfig = {
    low: {
      label: 'Low Priority',
      icon: <TrendingDown className="w-3 h-3" />,
      colors: {
        solid: 'bg-green-500 text-white',
        outlined: 'border-2 border-green-500 text-green-600 bg-green-50 hover:bg-green-100',
        gradient: 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30',
        glass: 'bg-green-500/15 backdrop-blur-lg border border-green-500/25 text-green-700 shadow-lg shadow-green-500/10'
      }
    },
    medium: {
      label: 'Medium Priority',
      icon: <Minus className="w-3 h-3" />,
      colors: {
        solid: 'bg-yellow-500 text-white',
        outlined: 'border-2 border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100',
        gradient: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30',
        glass: 'bg-yellow-500/15 backdrop-blur-lg border border-yellow-500/25 text-yellow-700 shadow-lg shadow-yellow-500/10'
      }
    },
    high: {
      label: 'High Priority',
      icon: <TrendingUp className="w-3 h-3" />,
      colors: {
        solid: 'bg-orange-500 text-white',
        outlined: 'border-2 border-orange-500 text-orange-600 bg-orange-50 hover:bg-orange-100',
        gradient: 'bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30',
        glass: 'bg-orange-500/15 backdrop-blur-lg border border-orange-500/25 text-orange-700 shadow-lg shadow-orange-500/10'
      }
    },
    urgent: {
      label: 'Urgent',
      icon: <AlertTriangle className="w-3 h-3" />,
      colors: {
        solid: 'bg-red-500 text-white',
        outlined: 'border-2 border-red-500 text-red-600 bg-red-50 hover:bg-red-100',
        gradient: 'bg-gradient-to-r from-red-500 via-red-600 to-pink-500 text-white shadow-lg shadow-red-500/30',
        glass: 'bg-red-500/15 backdrop-blur-lg border border-red-500/25 text-red-700 shadow-lg shadow-red-500/10'
      }
    }
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-1 rounded-full',
    medium: 'text-sm px-3 py-1.5 rounded-full',
    large: 'text-base px-4 py-2 rounded-full'
  };

  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold transition-all duration-300 transform hover:scale-105',
        config.colors[variant],
        sizeClasses[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};

// Impact Badge Component
export const ImpactBadge: React.FC<ImpactBadgeProps> = ({
  impact,
  size = 'medium',
  variant = 'glass',
  showIcon = true,
  pulse = false,
  className = ''
}) => {
  const impactConfig = {
    low: {
      label: 'Low Impact',
      icon: <CheckCircle className="w-3 h-3" />,
      colors: {
        solid: 'bg-blue-500 text-white',
        outlined: 'border-2 border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100',
        gradient: 'bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30',
        glass: 'bg-blue-500/15 backdrop-blur-lg border border-blue-500/25 text-blue-700 shadow-lg shadow-blue-500/10'
      }
    },
    medium: {
      label: 'Medium Impact',
      icon: <Target className="w-3 h-3" />,
      colors: {
        solid: 'bg-indigo-500 text-white',
        outlined: 'border-2 border-indigo-500 text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
        gradient: 'bg-gradient-to-r from-indigo-400 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30',
        glass: 'bg-indigo-500/15 backdrop-blur-lg border border-indigo-500/25 text-indigo-700 shadow-lg shadow-indigo-500/10'
      }
    },
    high: {
      label: 'High Impact',
      icon: <Zap className="w-3 h-3" />,
      colors: {
        solid: 'bg-purple-500 text-white',
        outlined: 'border-2 border-purple-500 text-purple-600 bg-purple-50 hover:bg-purple-100',
        gradient: 'bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30',
        glass: 'bg-purple-500/15 backdrop-blur-lg border border-purple-500/25 text-purple-700 shadow-lg shadow-purple-500/10'
      }
    },
    critical: {
      label: 'Critical Impact',
      icon: <Clock className="w-3 h-3" />,
      colors: {
        solid: 'bg-pink-500 text-white',
        outlined: 'border-2 border-pink-500 text-pink-600 bg-pink-50 hover:bg-pink-100',
        gradient: 'bg-gradient-to-r from-pink-500 via-pink-600 to-rose-500 text-white shadow-lg shadow-pink-500/30',
        glass: 'bg-pink-500/15 backdrop-blur-lg border border-pink-500/25 text-pink-700 shadow-lg shadow-pink-500/10'
      }
    }
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-1 rounded-full',
    medium: 'text-sm px-3 py-1.5 rounded-full',
    large: 'text-base px-4 py-2 rounded-full'
  };

  const config = impactConfig[impact];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold transition-all duration-300 transform hover:scale-105',
        config.colors[variant],
        sizeClasses[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};

// Combined Priority & Impact Badge
interface CombinedBadgeProps {
  priority: PriorityLevel;
  impact: ImpactLevel;
  size?: 'small' | 'medium' | 'large';
  variant?: 'solid' | 'outlined' | 'gradient' | 'glass';
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export const CombinedBadge: React.FC<CombinedBadgeProps> = ({
  priority,
  impact,
  size = 'medium',
  variant = 'glass',
  layout = 'horizontal',
  className = ''
}) => {
  return (
    <div
      className={cn(
        'flex gap-2',
        layout === 'vertical' ? 'flex-col' : 'flex-row items-center',
        className
      )}
    >
      <PriorityBadge priority={priority} size={size} variant={variant} />
      <ImpactBadge impact={impact} size={size} variant={variant} />
    </div>
  );
};
