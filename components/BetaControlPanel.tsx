'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Zap,
  Brain,
  Heart,
  Sparkles,
  TestTube,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface BetaUserPreferences {
  experienceTier: 'gentle' | 'deep' | 'mystical' | 'auto';
  features: {
    loopingProtocol: 'off' | 'light' | 'full' | 'auto';
    contemplativeSpace: boolean;
    storyWeaving: boolean;
    elementalResonance: boolean;
    morphicField: boolean;
  };
  conversationStyle: {
    responseSpeed: 'fastest' | 'balanced' | 'thorough';
    witnessingDepth: 'surface' | 'moderate' | 'deep';
    directiveness: 'pure-witness' | 'gentle-guidance' | 'active-support';
  };
  accessibility: {
    processingStyle: 'neurotypical' | 'adhd' | 'autism' | 'custom';
    pauseTolerance: 'minimal' | 'moderate' | 'extended';
    sensoryIntensity: number;
  };
  betaFeatures: {
    showDebugInfo: boolean;
    reportingMode: 'passive' | 'active' | 'detailed';
    experimentalFeatures: boolean;
  };
}

interface OneClickAdjustment {
  label: string;
  action: string;
  preview: string;
}

interface BetaControlPanelProps {
  userId: string;
  currentPreferences: BetaUserPreferences;
  oneClickAdjustments: OneClickAdjustment[];
  abTestInfo?: {
    group: string;
    tests: string[];
  };
  onPreferenceChange: (preferences: Partial<BetaUserPreferences>) => void;
  onOneClickAdjustment: (action: string) => void;
  onPresetSelect: (preset: string) => void;
}

export function BetaControlPanel({
  userId,
  currentPreferences,
  oneClickAdjustments,
  abTestInfo,
  onPreferenceChange,
  onOneClickAdjustment,
  onPresetSelect
}: BetaControlPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // === PROGRESSIVE DISCLOSURE LEVELS ===
  const [userLevel, setUserLevel] = useState<'basic' | 'intermediate' | 'advanced'>('basic');

  useEffect(() => {
    // Determine user level based on usage patterns
    const hasCustomSettings = JSON.stringify(currentPreferences) !== JSON.stringify(getDefaultPreferences());
    const usesDebugFeatures = currentPreferences.betaFeatures.showDebugInfo;

    if (usesDebugFeatures) {
      setUserLevel('advanced');
    } else if (hasCustomSettings) {
      setUserLevel('intermediate');
    } else {
      setUserLevel('basic');
    }
  }, [currentPreferences]);

  // === QUICK ADJUSTMENTS (ALWAYS VISIBLE) ===
  const renderOneClickAdjustments = () => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-blue-500" />
          Quick Adjustments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {oneClickAdjustments.map((adjustment, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onOneClickAdjustment(adjustment.action)}
            className="w-full text-left justify-start h-auto py-2 px-3"
          >
            <div>
              <div className="font-medium text-xs">{adjustment.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {adjustment.preview}
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );

  // === BASIC LEVEL (SPEED + PRESETS) ===
  const renderBasicControls = () => (
    <div className="space-y-4">
      {/* Speed Preference */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-green-500" />
            Response Speed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {['fastest', 'balanced', 'thorough'].map((speed) => (
              <Button
                key={speed}
                variant={currentPreferences.conversationStyle.responseSpeed === speed ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPreferenceChange({
                  conversationStyle: {
                    ...currentPreferences.conversationStyle,
                    responseSpeed: speed as any
                  }
                })}
                className="capitalize text-xs"
              >
                {speed}
              </Button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {currentPreferences.conversationStyle.responseSpeed === 'fastest' && 'Quick, direct responses'}
            {currentPreferences.conversationStyle.responseSpeed === 'balanced' && 'Thoughtful but efficient'}
            {currentPreferences.conversationStyle.responseSpeed === 'thorough' && 'Deep, contemplative responses'}
          </div>
        </CardContent>
      </Card>

      {/* Quick Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4 text-purple-500" />
            Experience Presets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { key: 'quick-checkin', label: 'Quick Check-in', desc: 'Fast, simple conversations' },
            { key: 'therapeutic', label: 'Therapeutic', desc: 'Deep witnessing and support' },
            { key: 'contemplative', label: 'Contemplative', desc: 'Mystical, spacious dialogue' },
            { key: 'experimental', label: 'Experimental', desc: 'All features enabled' }
          ].map((preset) => (
            <Button
              key={preset.key}
              variant="outline"
              size="sm"
              onClick={() => onPresetSelect(preset.key)}
              className="w-full text-left justify-start h-auto py-2 px-3"
            >
              <div>
                <div className="font-medium text-xs">{preset.label}</div>
                <div className="text-xs text-muted-foreground">{preset.desc}</div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Show More Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced(true)}
        className="w-full text-xs"
      >
        <Settings className="w-4 h-4 mr-2" />
        Advanced Settings
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  // === INTERMEDIATE LEVEL (INDIVIDUAL FEATURES) ===
  const renderIntermediateControls = () => (
    <Tabs defaultValue="features" className="w-full">
      <TabsList className="grid w-full grid-cols-3 text-xs">
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="style">Style</TabsTrigger>
        <TabsTrigger value="access">Access</TabsTrigger>
      </TabsList>

      <TabsContent value="features" className="space-y-3 mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Core Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Looping Protocol */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-medium">Looping Protocol</label>
                <Select
                  value={currentPreferences.features.loopingProtocol}
                  onValueChange={(value) => onPreferenceChange({
                    features: {
                      ...currentPreferences.features,
                      loopingProtocol: value as any
                    }
                  })}
                >
                  <SelectTrigger className="w-20 h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-xs text-muted-foreground">
                Checking for understanding and clarification
              </div>
            </div>

            {/* Other Feature Toggles */}
            {[
              { key: 'contemplativeSpace', label: 'Contemplative Pauses', desc: 'Natural breathing space in conversation' },
              { key: 'elementalResonance', label: 'Elemental Attunement', desc: 'Energy matching and resonance' },
              { key: 'morphicField', label: 'Collective Wisdom', desc: 'Draw on shared human insights' }
            ].map((feature) => (
              <div key={feature.key} className="flex justify-between items-center">
                <div>
                  <div className="text-xs font-medium">{feature.label}</div>
                  <div className="text-xs text-muted-foreground">{feature.desc}</div>
                </div>
                <Switch
                  checked={currentPreferences.features[feature.key]}
                  onCheckedChange={(checked) => onPreferenceChange({
                    features: {
                      ...currentPreferences.features,
                      [feature.key]: checked
                    }
                  })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="style" className="space-y-3 mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Conversation Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Witnessing Depth */}
            <div>
              <label className="text-xs font-medium block mb-2">Witnessing Depth</label>
              <div className="grid grid-cols-3 gap-2">
                {['surface', 'moderate', 'deep'].map((depth) => (
                  <Button
                    key={depth}
                    variant={currentPreferences.conversationStyle.witnessingDepth === depth ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPreferenceChange({
                      conversationStyle: {
                        ...currentPreferences.conversationStyle,
                        witnessingDepth: depth as any
                      }
                    })}
                    className="capitalize text-xs"
                  >
                    {depth}
                  </Button>
                ))}
              </div>
            </div>

            {/* Directiveness */}
            <div>
              <label className="text-xs font-medium block mb-2">Guidance Style</label>
              <Select
                value={currentPreferences.conversationStyle.directiveness}
                onValueChange={(value) => onPreferenceChange({
                  conversationStyle: {
                    ...currentPreferences.conversationStyle,
                    directiveness: value as any
                  }
                })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pure-witness">Pure Witness</SelectItem>
                  <SelectItem value="gentle-guidance">Gentle Guidance</SelectItem>
                  <SelectItem value="active-support">Active Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="access" className="space-y-3 mt-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Accessibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Processing Style */}
            <div>
              <label className="text-xs font-medium block mb-2">Processing Style</label>
              <Select
                value={currentPreferences.accessibility.processingStyle}
                onValueChange={(value) => onPreferenceChange({
                  accessibility: {
                    ...currentPreferences.accessibility,
                    processingStyle: value as any
                  }
                })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neurotypical">Neurotypical</SelectItem>
                  <SelectItem value="adhd">ADHD-Friendly</SelectItem>
                  <SelectItem value="autism">Autism-Friendly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sensory Intensity */}
            <div>
              <label className="text-xs font-medium block mb-2">
                Sensory Intensity: {currentPreferences.accessibility.sensoryIntensity}
              </label>
              <Slider
                value={[currentPreferences.accessibility.sensoryIntensity]}
                onValueChange={(value) => onPreferenceChange({
                  accessibility: {
                    ...currentPreferences.accessibility,
                    sensoryIntensity: value[0]
                  }
                })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Lower = gentler, Higher = more vivid
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );

  // === ADVANCED LEVEL (DEBUG + BETA) ===
  const renderAdvancedControls = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TestTube className="w-4 h-4 text-orange-500" />
          Beta Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* A/B Test Info */}
        {abTestInfo && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-xs font-medium mb-1">Test Group: {abTestInfo.group}</div>
            <div className="text-xs text-muted-foreground">
              Active tests: {abTestInfo.tests.join(', ')}
            </div>
          </div>
        )}

        {/* Debug Features */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-medium">Debug Information</div>
              <div className="text-xs text-muted-foreground">Show activation details</div>
            </div>
            <Switch
              checked={currentPreferences.betaFeatures.showDebugInfo}
              onCheckedChange={(checked) => onPreferenceChange({
                betaFeatures: {
                  ...currentPreferences.betaFeatures,
                  showDebugInfo: checked
                }
              })}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-medium">Experimental Features</div>
              <div className="text-xs text-muted-foreground">Access unreleased features</div>
            </div>
            <Switch
              checked={currentPreferences.betaFeatures.experimentalFeatures}
              onCheckedChange={(checked) => onPreferenceChange({
                betaFeatures: {
                  ...currentPreferences.betaFeatures,
                  experimentalFeatures: checked
                }
              })}
            />
          </div>

          {/* Reporting Mode */}
          <div>
            <label className="text-xs font-medium block mb-2">Feedback Reporting</label>
            <Select
              value={currentPreferences.betaFeatures.reportingMode}
              onValueChange={(value) => onPreferenceChange({
                betaFeatures: {
                  ...currentPreferences.betaFeatures,
                  reportingMode: value as any
                }
              })}
            >
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passive">Passive</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="detailed">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // === RENDER BASED ON USER LEVEL ===
  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-4">
      {/* Always show one-click adjustments */}
      {renderOneClickAdjustments()}

      {/* Progressive disclosure based on user level and settings */}
      {!showAdvanced && renderBasicControls()}

      {showAdvanced && (
        <div className="space-y-4">
          {/* Show/Hide Advanced Button */}
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="text-xs">
              {userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} User
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(false)}
              className="text-xs"
            >
              <ChevronUp className="w-4 h-4 mr-2" />
              Simple View
            </Button>
          </div>

          {renderIntermediateControls()}
          {userLevel === 'advanced' && renderAdvancedControls()}
        </div>
      )}

      {/* User Info Footer */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
        User: {userId.slice(0, 8)}... | Tier: {currentPreferences.experienceTier}
      </div>
    </div>
  );
}

// Helper function for default preferences
function getDefaultPreferences(): BetaUserPreferences {
  return {
    experienceTier: 'auto',
    features: {
      loopingProtocol: 'auto',
      contemplativeSpace: true,
      storyWeaving: false,
      elementalResonance: true,
      morphicField: false
    },
    conversationStyle: {
      responseSpeed: 'balanced',
      witnessingDepth: 'moderate',
      directiveness: 'gentle-guidance'
    },
    accessibility: {
      processingStyle: 'neurotypical',
      pauseTolerance: 'moderate',
      sensoryIntensity: 5
    },
    betaFeatures: {
      showDebugInfo: false,
      reportingMode: 'passive',
      experimentalFeatures: false
    }
  };
}