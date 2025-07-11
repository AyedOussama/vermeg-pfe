// ============================================================================
// BADGE DEMO PAGE - Showcase of all badge styles
// ============================================================================

import React from 'react';
import { Badge } from '@/components/common/Badge';
import { PriorityBadge, ImpactBadge, CombinedBadge } from '@/components/common/PriorityBadge';
import { Star, Heart, Zap } from 'lucide-react';

const BadgeDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Badge Showcase</h1>
          <p className="text-lg text-gray-600">Modern, attractive badges for your application</p>
        </div>

        {/* Priority Badges */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Priority Badges</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Glass Effect (Recommended) ✨</h3>
              <div className="flex flex-wrap gap-4">
                <PriorityBadge priority="low" variant="glass" />
                <PriorityBadge priority="medium" variant="glass" />
                <PriorityBadge priority="high" variant="glass" />
                <PriorityBadge priority="urgent" variant="glass" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Gradient Style</h3>
              <div className="flex flex-wrap gap-4">
                <PriorityBadge priority="low" variant="gradient" />
                <PriorityBadge priority="medium" variant="gradient" />
                <PriorityBadge priority="high" variant="gradient" />
                <PriorityBadge priority="urgent" variant="gradient" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Outlined Style</h3>
              <div className="flex flex-wrap gap-4">
                <PriorityBadge priority="low" variant="outlined" />
                <PriorityBadge priority="medium" variant="outlined" />
                <PriorityBadge priority="high" variant="outlined" />
                <PriorityBadge priority="urgent" variant="outlined" />
              </div>
            </div>
          </div>
        </section>

        {/* Impact Badges */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Impact Badges</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Glass Effect (Recommended) ✨</h3>
              <div className="flex flex-wrap gap-4">
                <ImpactBadge impact="low" variant="glass" />
                <ImpactBadge impact="medium" variant="glass" />
                <ImpactBadge impact="high" variant="glass" />
                <ImpactBadge impact="critical" variant="glass" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Gradient Style</h3>
              <div className="flex flex-wrap gap-4">
                <ImpactBadge impact="low" variant="gradient" />
                <ImpactBadge impact="medium" variant="gradient" />
                <ImpactBadge impact="high" variant="gradient" />
                <ImpactBadge impact="critical" variant="gradient" />
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Standard Badges */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Enhanced Standard Badges</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Modern Gradient Style</h3>
              <div className="flex flex-wrap gap-4">
                <Badge content="Low Priority" color="low-priority" variant="modern" icon={<Star className="w-3 h-3" />} />
                <Badge content="High Impact" color="high-impact" variant="modern" icon={<Zap className="w-3 h-3" />} />
                <Badge content="Medium Priority" color="medium-priority" variant="modern" icon={<Heart className="w-3 h-3" />} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Outlined Style</h3>
              <div className="flex flex-wrap gap-4">
                <Badge content="Low Priority" color="low-priority" variant="outlined" />
                <Badge content="High Impact" color="high-impact" variant="outlined" />
                <Badge content="Medium Priority" color="medium-priority" variant="outlined" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">With Pulse Animation</h3>
              <div className="flex flex-wrap gap-4">
                <Badge content="Urgent" color="error" variant="modern" pulse />
                <Badge content="New" color="success" variant="modern" pulse />
                <Badge content="Hot" color="warning" variant="modern" pulse />
              </div>
            </div>
          </div>
        </section>

        {/* Combined Badges */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Combined Priority & Impact</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Horizontal Layout</h3>
              <div className="space-y-4">
                <CombinedBadge priority="high" impact="high" variant="gradient" />
                <CombinedBadge priority="medium" impact="critical" variant="gradient" />
                <CombinedBadge priority="low" impact="medium" variant="gradient" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Vertical Layout</h3>
              <div className="flex gap-8">
                <CombinedBadge priority="urgent" impact="critical" variant="gradient" layout="vertical" />
                <CombinedBadge priority="high" impact="high" variant="glass" layout="vertical" />
                <CombinedBadge priority="medium" impact="low" variant="outlined" layout="vertical" />
              </div>
            </div>
          </div>
        </section>

        {/* Size Variations */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Size Variations</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Priority Badges</h3>
              <div className="flex items-center gap-4">
                <PriorityBadge priority="high" size="small" variant="gradient" />
                <PriorityBadge priority="high" size="medium" variant="gradient" />
                <PriorityBadge priority="high" size="large" variant="gradient" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Impact Badges</h3>
              <div className="flex items-center gap-4">
                <ImpactBadge impact="high" size="small" variant="gradient" />
                <ImpactBadge impact="high" size="medium" variant="gradient" />
                <ImpactBadge impact="high" size="large" variant="gradient" />
              </div>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Real-world Usage Examples</h2>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Data Science Manager</h4>
                  <p className="text-gray-600">Lead our data science initiatives...</p>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority="low" variant="gradient" size="small" />
                  <ImpactBadge impact="high" variant="gradient" size="small" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Full Stack Developer</h4>
                  <p className="text-gray-600">Build advanced analytics solutions...</p>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority="medium" variant="gradient" size="small" />
                  <ImpactBadge impact="high" variant="gradient" size="small" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BadgeDemo;
