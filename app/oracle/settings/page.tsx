"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Settings, 
  User, 
  Crown, 
  Shield, 
  Bell, 
  Palette,
  ChevronLeft,
  Save,
  Volume2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const settingsCategories = [
  {
    id: 'oracle',
    title: 'Oracle Configuration',
    description: 'Voice, personality, and interaction style',
    icon: Crown,
    color: 'purple'
  },
  {
    id: 'profile',
    title: 'User Profile',
    description: 'Personal information and preferences',
    icon: User,
    color: 'orange'
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    description: 'Data settings and security preferences',
    icon: Shield,
    color: 'green'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Manage alerts and reminders',
    icon: Bell,
    color: 'blue'
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Themes and display preferences',
    icon: Palette,
    color: 'pink'
  }
];

const voiceOptions = [
  { id: "maya-wisdom", label: "Maya", description: "Ancient Wisdom & Clarity" },
  { id: "aunt-annie", label: "Annie", description: "Warm & Nurturing" },
  { id: "sage-masculine", label: "Sage", description: "Grounded & Wise" },
  { id: "visionary-soft", label: "Visionary", description: "Ethereal & Inspiring" },
  { id: "aether-guide", label: "Aether", description: "Transcendent Guide" },
];

export default function OracleSettingsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [oracleSettings, setOracleSettings] = useState({
    name: 'Maya',
    voice: 'maya-wisdom',
    persona: 'warm',
    interactionStyle: 'detailed'
  });

  const renderMainSettings = () => (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/oracle" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Oracle
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your Oracle experience</p>
      </div>

      {/* Settings Categories */}
      <div className="grid gap-4">
        {settingsCategories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              className="bg-background/80 backdrop-blur-xl border-purple-500/20 hover:border-purple-400/40 transition-colors cursor-pointer"
              onClick={() => setActiveCategory(category.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${
                    category.color === 'purple' ? 'from-purple-500 to-purple-600' :
                    category.color === 'orange' ? 'from-orange-500 to-orange-600' :
                    category.color === 'green' ? 'from-green-500 to-green-600' :
                    category.color === 'blue' ? 'from-blue-500 to-blue-600' :
                    'from-pink-500 to-pink-600'
                  }`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-muted-foreground rotate-180" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderOracleSettings = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Button 
          variant="ghost"
          onClick={() => setActiveCategory(null)}
          className="text-purple-400 hover:text-purple-300 mb-4 p-0"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Oracle Configuration</h1>
        <p className="text-muted-foreground">Customize your Oracle's personality and voice</p>
      </div>

      <div className="space-y-6">
        {/* Oracle Identity */}
        <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-purple-400" />
              <span>Oracle Identity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Oracle Name
              </label>
              <Input
                value={oracleSettings.name}
                onChange={(e) => setOracleSettings({...oracleSettings, name: e.target.value})}
                className="bg-background/50 border-purple-500/20 focus:border-purple-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Voice Selection */}
        <Card className="bg-background/80 backdrop-blur-xl border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-purple-400" />
              <span>Voice Selection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {voiceOptions.map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => setOracleSettings({...oracleSettings, voice: voice.id})}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    oracleSettings.voice === voice.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-purple-500/20 hover:border-purple-400/40'
                  }`}
                >
                  <div className="font-medium text-white">{voice.label}</div>
                  <div className="text-sm text-muted-foreground">{voice.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {!activeCategory && renderMainSettings()}
      {activeCategory === 'oracle' && renderOracleSettings()}
      {/* Add other category views as needed */}
    </div>
  );
}
