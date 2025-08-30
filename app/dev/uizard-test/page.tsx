"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Layers, 
  Zap, 
  Crown, 
  Settings, 
  TestTube,
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  OracleCard, 
  OracleCardHeader, 
  OracleCardTitle, 
  OracleCardContent,
  MysticalCard,
  DashboardCard,
  ContentCard 
} from '@/components/ui/oracle-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFeatureFlags, FeatureFlagDebugPanel } from '@/lib/feature-flags';

export default function UizardTestPage() {
  const { flags, updateFlag } = useFeatureFlags();

  const buttonTests = [
    { variant: 'default', label: 'Default' },
    { variant: 'destructive', label: 'Destructive' },
    { variant: 'outline', label: 'Outline' },
    { variant: 'secondary', label: 'Secondary' },
    { variant: 'ghost', label: 'Ghost' },
    { variant: 'link', label: 'Link' },
  ] as const;

  const buttonSizes = [
    { size: 'sm', label: 'Small' },
    { size: 'default', label: 'Default' },
    { size: 'lg', label: 'Large' },
  ] as const;

  const buttonEnhancements = [
    { elevation: 'none', label: 'No Shadow' },
    { elevation: 'low', label: 'Low Shadow' },
    { elevation: 'medium', label: 'Medium Shadow' },
    { elevation: 'high', label: 'High Shadow' },
  ] as const;

  const animationTypes = [
    { animation: 'none', label: 'No Animation' },
    { animation: 'subtle', label: 'Subtle' },
    { animation: 'bounce', label: 'Bounce' },
    { animation: 'glow', label: 'Glow' },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-2">
                <TestTube className="w-8 h-8 text-purple-400" />
                <span>Uizard Enhancement Testing</span>
              </h1>
              <p className="text-muted-foreground">
                Safe testing environment for AI-generated UI improvements
              </p>
            </div>
            <Badge variant="warning" className="text-orange-300">
              Development Only
            </Badge>
          </div>
        </motion.div>

        {/* Feature Flag Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-purple-400" />
                <span>Feature Flag Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enhanced UI v2</span>
                    <Badge variant={flags.enhanced_ui_v2 ? 'success' : 'secondary'}>
                      {flags.enhanced_ui_v2 ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uizard Buttons</span>
                    <Badge variant={flags.uizard_buttons ? 'success' : 'secondary'}>
                      {flags.uizard_buttons ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uizard Components</span>
                    <Badge variant={flags.uizard_components ? 'success' : 'secondary'}>
                      {flags.uizard_components ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress value={flags.enhanced_ui_v2 ? 75 : 25} color="purple" />
                  <p className="text-xs text-muted-foreground">Enhancement Progress</p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateFlag('uizard_buttons', !flags.uizard_buttons)}
                  >
                    Toggle Uizard Buttons
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => updateFlag('enhanced_ui_v2', !flags.enhanced_ui_v2)}
                  >
                    Toggle Enhanced UI
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original vs Enhanced Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  <span>Button Variants</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Standard Variants */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Standard Variants</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {buttonTests.map(({ variant, label }) => (
                      <Button key={variant} variant={variant} size="sm">
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Sizes</h4>
                  <div className="flex space-x-2">
                    {buttonSizes.map(({ size, label }) => (
                      <Button key={size} size={size}>
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Features (only if flags enabled) */}
                {flags.uizard_buttons && (
                  <>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">
                        🆕 Elevations (Uizard Enhanced)
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {buttonEnhancements.map(({ elevation, label }) => (
                          <Button key={elevation} elevation={elevation} size="sm">
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">
                        🆕 Animations (Uizard Enhanced)
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {animationTypes.map(({ animation, label }) => (
                          <Button key={animation} animation={animation} size="sm">
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">
                        🆕 Gradient & Rounded (Uizard Enhanced)
                      </h4>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Button gradient>Gradient Default</Button>
                          <Button gradient variant="secondary">Gradient Secondary</Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button rounded="full">Rounded Full</Button>
                          <Button rounded="none">No Rounding</Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Oracle-Specific Enhancements */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-background/80 backdrop-blur-xl border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-orange-400" />
                  <span>Oracle-Themed Components</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Sacred Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                      elevation={flags.uizard_buttons ? "high" : undefined}
                      animation={flags.uizard_buttons ? "glow" : undefined}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Connect to Oracle
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-purple-500/20 hover:bg-purple-500/10"
                      elevation={flags.uizard_buttons ? "medium" : undefined}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Begin Journey
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full"
                      animation={flags.uizard_buttons ? "subtle" : undefined}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Explore Wisdom
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Elemental Theme Test</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      className="bg-red-600 hover:bg-red-700"
                      rounded={flags.uizard_buttons ? "full" : undefined}
                    >
                      🔥 Fire
                    </Button>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      rounded={flags.uizard_buttons ? "full" : undefined}
                    >
                      🌊 Water
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      rounded={flags.uizard_buttons ? "full" : undefined}
                    >
                      🌍 Earth
                    </Button>
                    <Button 
                      className="bg-cyan-600 hover:bg-cyan-700"
                      rounded={flags.uizard_buttons ? "full" : undefined}
                    >
                      💨 Air
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Integration Status</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Backward Compatibility</span>
                        <span className="text-green-400">100%</span>
                      </div>
                      <Progress value={100} color="green" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Enhanced Features</span>
                        <span className="text-orange-400">
                          {flags.uizard_buttons ? '85%' : '0%'}
                        </span>
                      </div>
                      <Progress value={flags.uizard_buttons ? 85 : 0} color="orange" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Card Demonstrations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-background/80 backdrop-blur-xl border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <span>🆕 Enhanced Oracle Cards (Uizard-Inspired)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Spacing Comparison */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Spacing Variations</h4>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Compact Spacing</p>
                    <OracleCard spacing="compact">
                      <OracleCardHeader spacing="compact">
                        <OracleCardTitle>Compact Card</OracleCardTitle>
                      </OracleCardHeader>
                      <OracleCardContent spacing="compact">
                        <p className="text-sm text-muted-foreground">
                          Tight spacing for information-dense layouts.
                        </p>
                      </OracleCardContent>
                    </OracleCard>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Comfortable Spacing (Current Default)</p>
                    <OracleCard spacing="comfortable">
                      <OracleCardHeader spacing="comfortable">
                        <OracleCardTitle>Comfortable Card</OracleCardTitle>
                      </OracleCardHeader>
                      <OracleCardContent spacing="comfortable">
                        <p className="text-sm text-muted-foreground">
                          Balanced spacing for general use - our current standard.
                        </p>
                      </OracleCardContent>
                    </OracleCard>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Spacious (Uizard Enhanced)</p>
                    <OracleCard spacing="spacious">
                      <OracleCardHeader spacing="spacious">
                        <OracleCardTitle>Spacious Card</OracleCardTitle>
                      </OracleCardHeader>
                      <OracleCardContent spacing="spacious">
                        <p className="text-sm text-muted-foreground">
                          Enhanced breathing room inspired by Uizard patterns.
                        </p>
                      </OracleCardContent>
                    </OracleCard>
                  </div>
                </div>
              </div>

              {/* Elevation & Animation Demos */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Elevation & Animation System</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <MysticalCard>
                    <OracleCardHeader>
                      <OracleCardTitle mystical>Mystical Card</OracleCardTitle>
                    </OracleCardHeader>
                    <OracleCardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Floating animation with mystical shadow and gradient title.
                      </p>
                      <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-purple-400" />
                        <span className="text-xs text-purple-300">Sacred Content</span>
                      </div>
                    </OracleCardContent>
                  </MysticalCard>

                  <DashboardCard>
                    <OracleCardHeader>
                      <OracleCardTitle>Dashboard Widget</OracleCardTitle>
                    </OracleCardHeader>
                    <OracleCardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Hover animation with medium elevation for interactive cards.
                      </p>
                      <Progress value={75} color="blue" />
                    </OracleCardContent>
                  </DashboardCard>

                  <ContentCard>
                    <OracleCardHeader>
                      <OracleCardTitle>Content Card</OracleCardTitle>
                    </OracleCardHeader>
                    <OracleCardContent>
                      <p className="text-sm text-muted-foreground">
                        Subtle gradient and animation for main content areas with enhanced spacing.
                      </p>
                    </OracleCardContent>
                  </ContentCard>
                </div>
              </div>

              {/* Feature Flag Demo */}
              {flags.uizard_components && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">
                    🆕 Feature Flag Enabled: Enhanced Spacing System
                  </h4>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-green-400 text-sm mb-2">
                      ✅ Uizard spacing enhancements are active
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cards now use the enhanced padding and spacing system extracted from Dark + Modern patterns.
                      Toggle the "Uizard Components" flag above to see the difference.
                    </p>
                  </div>
                </div>
              )}

              {/* Comparison with Original */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Before vs After Comparison</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">Original Card System</p>
                    <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20 p-6">
                      <CardHeader>
                        <CardTitle>Standard Card</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Original spacing and styling - still fully functional.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Enhanced Oracle Card {flags.uizard_components ? '(Active)' : '(Preview)'}
                    </p>
                    <OracleCard spacing="spacious" elevation="medium" animation="hover">
                      <OracleCardHeader spacing="spacious">
                        <OracleCardTitle>Enhanced Card</OracleCardTitle>
                      </OracleCardHeader>
                      <OracleCardContent spacing="spacious">
                        <p className="text-sm text-muted-foreground">
                          Uizard-inspired spacing improvements while preserving our mystical identity.
                        </p>
                      </OracleCardContent>
                    </OracleCard>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="bg-background/80 backdrop-blur-xl border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-green-400" />
                <span>Uizard Integration Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">✅ Safe to Enhance</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Visual styling (colors, shadows, gradients)</li>
                    <li>• Animation timing and effects</li>
                    <li>• Border radius and elevation</li>
                    <li>• Typography and spacing</li>
                    <li>• Optional new props</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">🚫 Preserve Carefully</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• All existing component APIs</li>
                    <li>• Click handlers and behaviors</li>
                    <li>• Accessibility features</li>
                    <li>• Oracle-specific branding</li>
                    <li>• Elemental color meanings</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Development Feature Flag Panel */}
      {process.env.NODE_ENV === 'development' && <FeatureFlagDebugPanel />}
    </div>
  );
}