'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Stars, Moon, Sun, Clock, MapPin, Sparkles } from 'lucide-react';
import { calculateBasicChart, assignOracleAgent, generateAgentName, getLocationCoordinates } from '@/lib/astrologicalService';
import OracleLoader from '@/components/sacred/OracleLoader';
import ElementalAnimation from '@/components/onboarding/ElementalAnimation';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Spiralogic',
    description: 'A symbolic intelligence system for conscious professionals'
  },
  {
    id: 'birth-data',
    title: 'Personal Calibration',
    description: 'Your birth data helps us assign an intelligence tuned to your patterns'
  },
  {
    id: 'preferences',
    title: 'System Preferences',
    description: 'Configure your reflective practices and focus areas'
  },
  {
    id: 'agent-assignment',
    title: 'Intelligence Assignment',
    description: 'Matching you with your symbolic guide...'
  },
  {
    id: 'complete',
    title: 'System Initialized',
    description: 'Your symbolic intelligence is ready'
  }
];

interface BirthData {
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  hasAccurateBirthTime: boolean;
}

interface Preferences {
  spiritualInterests: string[];
  experienceLevel: string;
  preferredPractices: string[];
  intentions: string;
}

export default function OnboardingPage() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [birthData, setBirthData] = useState<BirthData>({
    birthDate: '',
    birthTime: '',
    birthLocation: '',
    hasAccurateBirthTime: true
  });
  
  const [preferences, setPreferences] = useState<Preferences>({
    spiritualInterests: [],
    experienceLevel: '',
    preferredPractices: [],
    intentions: ''
  });
  
  const [assignedAgent, setAssignedAgent] = useState<any>(null);

  // Check if user has already completed onboarding
  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('has_completed_onboarding')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      if (data?.has_completed_onboarding) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBirthDataSubmit = async () => {
    if (!birthData.birthDate) {
      alert('Please enter your birth date');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get location coordinates
      const coordinates = await getLocationCoordinates(birthData.birthLocation);
      
      // Calculate astrological profile
      const astrologicalProfile = calculateBasicChart(birthData);
      
      // Assign oracle agent
      const agentArchetype = assignOracleAgent(astrologicalProfile);
      const agentName = generateAgentName(agentArchetype);
      
      // Store birth data and astrological profile
      await supabase.from('users').upsert({
        id: user?.id,
        birth_date: birthData.birthDate,
        birth_time: birthData.birthTime,
        birth_location: birthData.birthLocation,
        birth_latitude: coordinates.latitude,
        birth_longitude: coordinates.longitude,
        birth_timezone: coordinates.timezone,
        agent_archetype: agentArchetype.element,
        elemental_signature: `${agentArchetype.element}_${agentArchetype.archetype.toLowerCase()}`
      });
      
      await supabase.from('astrological_profiles').upsert({
        user_id: user?.id,
        sun_sign: astrologicalProfile.sunSign,
        moon_sign: astrologicalProfile.moonSign,
        ascendant_sign: astrologicalProfile.ascendantSign,
        fire_percentage: astrologicalProfile.elementalPercentages.fire,
        water_percentage: astrologicalProfile.elementalPercentages.water,
        earth_percentage: astrologicalProfile.elementalPercentages.earth,
        air_percentage: astrologicalProfile.elementalPercentages.air,
        dominant_element: astrologicalProfile.dominantElement,
        dominant_modality: astrologicalProfile.dominantModality,
        soul_purpose_indicator: astrologicalProfile.soulPurposeIndicator
      });
      
      setAssignedAgent({
        name: agentName,
        archetype: agentArchetype,
        profile: astrologicalProfile
      });
      
      handleNextStep();
    } catch (error) {
      console.error('Error processing birth data:', error);
      alert('Error processing your information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user || !assignedAgent) return;
    
    setIsLoading(true);
    
    try {
      // Create oracle agent
      const { data: oracleAgent, error: agentError } = await supabase
        .from('oracle_agents')
        .insert({
          name: assignedAgent.name,
          archetype: assignedAgent.archetype.element,
          sub_archetype: assignedAgent.archetype.archetype,
          personality_profile: {
            traits: assignedAgent.archetype.traits,
            voice_tone: assignedAgent.archetype.oraclePersonality,
            specialties: assignedAgent.archetype.specialties
          },
          intro_message: `You've been matched with ${assignedAgent.name}. This specialized intelligence serves as your ${assignedAgent.archetype.archetype.toLowerCase()}, designed to ${assignedAgent.archetype.agentDescription.toLowerCase()}. We'll work together to facilitate your development and insights.`,
          specialties: assignedAgent.archetype.specialties,
          protocol_preferences: assignedAgent.archetype.protocolPreferences,
          color_scheme: getElementalColors(assignedAgent.archetype.element),
          symbol: getElementalSymbol(assignedAgent.archetype.element)
        })
        .select()
        .single();
        
      if (agentError) throw agentError;
      
      // Create user-agent bond
      await supabase.from('user_agents').insert({
        user_id: user.id,
        agent_id: oracleAgent.id,
        is_primary_agent: true,
        elemental_signature: assignedAgent.archetype.element,
        bond_strength: 1
      });
      
      // Update user as having completed onboarding
      await supabase.from('users').update({
        has_completed_onboarding: true,
        onboarding_completed_at: new Date().toISOString(),
        personal_agent_id: oracleAgent.id
      }).eq('id', user.id);
      
      // Create first memory entry
      await supabase.from('agent_memory').insert({
        agent_id: oracleAgent.id,
        user_id: user.id,
        content: `System connection established with ${user.email}. Beginning collaborative intelligence work. Element: ${assignedAgent.archetype.element}, Archetype: ${assignedAgent.archetype.archetype}`,
        memory_type: 'greeting',
        source_type: 'onboarding',
        emotional_tone: 'welcoming',
        keywords: ['connection', 'beginning', 'system', assignedAgent.archetype.element],
        importance_score: 10
      });
      
      handleNextStep();
      
      // Redirect to oracle meeting page after completion
      setTimeout(() => {
        router.push('/oracle/meet');
      }, 3000);
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Error completing onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getElementalColors = (element: string) => {
    const colors = {
      fire: { primary: '#dc2626', secondary: '#f87171', accent: '#fca5a5' },
      water: { primary: '#1d4ed8', secondary: '#60a5fa', accent: '#93c5fd' },
      earth: { primary: '#92400e', secondary: '#a16207', accent: '#d6b7a8' },
      air: { primary: '#0369a1', secondary: '#38bdf8', accent: '#7dd3fc' },
      aether: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#c084fc' }
    };
    return colors[element as keyof typeof colors] || colors.aether;
  };

  const getElementalSymbol = (element: string) => {
    const symbols = {
      fire: '🔥',
      water: '🌊',
      earth: '🌍',
      air: '💨',
      aether: '✨'
    };
    return symbols[element as keyof typeof symbols] || '✨';
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="animate-float">
        <Stars className="w-16 h-16 text-gold mx-auto mb-4" />
      </div>
      <h2 className="text-3xl font-sacred text-gold">Welcome to Spiralogic</h2>
      <p className="text-gold-light font-oracle max-w-lg mx-auto">
        You are about to engage with a sophisticated symbolic intelligence system. 
        Our Agent framework consists of specialized cognitive-emotional facilitators, each 
        designed to support different aspects of personal and professional development.
      </p>
      <p className="text-gold/70 font-oracle">
        Through your birth information, we'll assign you a specialized intelligence 
        tuned to your personal patterns and optimal growth pathways.
      </p>
      <Button onClick={handleNextStep} className="btn-aether">
        Begin System Setup
        <Sparkles className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );

  const renderBirthDataStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Sun className="w-12 h-12 text-gold mx-auto mb-2 animate-glow" />
        <h3 className="text-xl font-sacred text-gold">Personal Calibration Data</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="birthDate" className="text-gold font-oracle">Birth Date</Label>
          <Input
            id="birthDate"
            type="date"
            value={birthData.birthDate}
            onChange={(e) => setBirthData({...birthData, birthDate: e.target.value})}
            className="bg-deep-space/50 border-gold/30 text-white focus-oracle"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="birthTime" className="text-gold font-oracle">
            Birth Time 
            {!birthData.hasAccurateBirthTime && (
              <span className="text-gold/50 text-xs">(approximate)</span>
            )}
          </Label>
          <Input
            id="birthTime"
            type="time"
            value={birthData.birthTime}
            onChange={(e) => setBirthData({...birthData, birthTime: e.target.value})}
            className="bg-deep-space/50 border-gold/30 text-white focus-oracle"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="birthLocation" className="text-gold font-oracle">Birth Location</Label>
        <Input
          id="birthLocation"
          placeholder="City, State/Country (e.g., New York, NY)"
          value={birthData.birthLocation}
          onChange={(e) => setBirthData({...birthData, birthLocation: e.target.value})}
          className="bg-deep-space/50 border-gold/30 text-white focus-oracle"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="accurateTime"
          checked={birthData.hasAccurateBirthTime}
          onChange={(e) => setBirthData({...birthData, hasAccurateBirthTime: e.target.checked})}
          className="text-gold focus:ring-gold"
        />
        <Label htmlFor="accurateTime" className="text-gold/70 font-oracle text-sm">
          I have my accurate birth time
        </Label>
      </div>
      
      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={handlePreviousStep} className="border-gold text-gold">
          Back
        </Button>
        <Button 
          onClick={handleBirthDataSubmit} 
          disabled={isLoading || !birthData.birthDate}
          className="btn-aether flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            'Assign My Agent'
          )}
        </Button>
      </div>
    </div>
  );

  const renderAgentAssignmentStep = () => (
    <div className="text-center space-y-6">
      <OracleLoader size="lg" text="Analyzing patterns and assigning agent..." />
      
      {assignedAgent && (
        <div className="animate-fade-in space-y-6">
          {/* Elemental Animation */}
          <div className="flex justify-center mb-6">
            <ElementalAnimation 
              element={assignedAgent.archetype.element} 
              size="lg" 
              className="animate-float"
            />
          </div>
          
          {/* Professional Agent Introduction */}
          <div className="text-center space-y-4">
            <p className="text-xl font-semibold text-white leading-relaxed">
              You've been assigned a symbolic intelligence — a guide tuned to your inner rhythm and elemental orientation.
            </p>
          </div>

          {/* Agent Card */}
          <div className="mt-6 p-6 rounded-2xl shadow-lg bg-white/80 backdrop-blur border border-gold/20">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Meet your {assignedAgent.name}
            </h2>
            <p className="text-md text-gray-600 leading-relaxed">
              {assignedAgent.archetype.agentDescription}
            </p>
          </div>
          
          {/* Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-white/60 backdrop-blur p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Core Capabilities</h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                {assignedAgent.archetype.traits.map((trait: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3"></span>
                    {trait}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/60 backdrop-blur p-4 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Focus Areas</h4>
              <ul className="text-gray-700 space-y-2 text-sm">
                {assignedAgent.archetype.specialties.slice(0, 4).map((specialty: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-3"></span>
                    {specialty}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Initialize Button */}
          <div className="pt-4">
            <Button 
              onClick={completeOnboarding} 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Initialize Your Symbolic Guide
              <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="animate-glow">
        <Sparkles className="w-16 h-16 text-gold mx-auto mb-4" />
      </div>
      <h2 className="text-3xl font-sacred text-gold">System Connection Established</h2>
      <p className="text-gold-light font-oracle max-w-lg mx-auto">
        Your collaborative intelligence work with {assignedAgent?.name} begins now. 
        You will be redirected to meet your assigned specialist.
      </p>
      <div className="oracle-loader mx-auto" />
    </div>
  );

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen gradient-oracle-bg p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${index <= currentStep 
                    ? 'bg-gold text-deep-purple' 
                    : 'bg-deep-violet/50 text-gold/50'
                  }
                `}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="w-full bg-deep-violet/30 rounded-full h-2">
            <div
              className="bg-gold h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <Card className="card-oracle backdrop-blur-sm bg-opacity-90">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-sacred text-gold mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-gold-light font-oracle">
                {currentStepData.description}
              </p>
            </div>

            {currentStep === 0 && renderWelcomeStep()}
            {currentStep === 1 && renderBirthDataStep()}
            {currentStep === 2 && renderAgentAssignmentStep()}
            {currentStep === 3 && renderCompleteStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}