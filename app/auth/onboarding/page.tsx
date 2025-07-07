'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IntegrationAuthService, OnboardingData } from '../../../lib/auth/integrationAuth';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'introduction',
    title: 'Welcome to Integration-Centered Development',
    description: 'Understanding our approach to sustainable growth'
  },
  {
    id: 'personal_info',
    title: 'Personal Information',
    description: 'Basic profile information'
  },
  {
    id: 'development_assessment',
    title: 'Development Assessment',
    description: 'Current state and support needs'
  },
  {
    id: 'privacy_settings',
    title: 'Privacy & Community',
    description: 'Control your data and community participation'
  },
  {
    id: 'integration_commitment',
    title: 'Integration Commitment',
    description: 'Understanding our process-centered approach'
  },
  {
    id: 'completion',
    title: 'Welcome to Your Journey',
    description: 'Your integration-centered platform is ready'
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const authService = new IntegrationAuthService();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalInfo: {
      displayName: '',
      bio: '',
      professionalBackground: ''
    },
    developmentAssessment: {
      currentChallenges: [],
      supportSought: [],
      experienceLevel: 'beginner',
      professionalSupportHistory: false
    },
    privacySettings: {
      communityVisibility: 'supportive',
      professionalSupportConsent: false,
      researchParticipation: false,
      dataRetentionPreference: 5
    },
    integrationCommitment: {
      reflectionPeriodConsent: false,
      realityCheckingConsent: false,
      communityAccountabilityConsent: false,
      professionalReferralConsent: false
    }
  });

  const updateOnboardingData = (section: keyof OnboardingData, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // In a real implementation, this would complete the onboarding process
      // and redirect to the main platform
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding completion error:', error);
    }
  };

  const renderStepContent = () => {
    switch (onboardingSteps[currentStep].id) {
      case 'introduction':
        return <IntroductionStep onNext={nextStep} />;
      
      case 'personal_info':
        return (
          <PersonalInfoStep
            data={onboardingData.personalInfo}
            onChange={(data) => updateOnboardingData('personalInfo', data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      
      case 'development_assessment':
        return (
          <DevelopmentAssessmentStep
            data={onboardingData.developmentAssessment}
            onChange={(data) => updateOnboardingData('developmentAssessment', data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      
      case 'privacy_settings':
        return (
          <PrivacySettingsStep
            data={onboardingData.privacySettings}
            onChange={(data) => updateOnboardingData('privacySettings', data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      
      case 'integration_commitment':
        return (
          <IntegrationCommitmentStep
            data={onboardingData.integrationCommitment}
            onChange={(data) => updateOnboardingData('integrationCommitment', data)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      
      case 'completion':
        return (
          <CompletionStep
            onComplete={completeOnboarding}
            onPrev={prevStep}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {onboardingSteps[currentStep].title}
            </h1>
            <p className="text-gray-600">
              {onboardingSteps[currentStep].description}
            </p>
          </div>

          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}

const IntroductionStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="space-y-6">
    <div className="prose max-w-none">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Welcome to an Integration-Centered Approach
      </h3>
      
      <div className="space-y-4 text-gray-700">
        <p>
          This platform is designed to support your human development through a process that 
          honors the slow, spiral nature of growth. We emphasize integration over accumulation, 
          ordinary moments over peak experiences, and community reality-checking over individual insight collection.
        </p>
        
        <h4 className="font-medium text-gray-900">What Makes This Different:</h4>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Process over breakthrough:</strong> We celebrate consistent daily practice over dramatic revelations</li>
          <li><strong>Integration requirements:</strong> New content is gated behind demonstrated real-world application</li>
          <li><strong>Reality grounding:</strong> Built-in prompts prevent spiritual bypassing and magical thinking</li>
          <li><strong>Community support:</strong> Peer validation for authentic development, not spiritual performance</li>
          <li><strong>Professional integration:</strong> Seamless connection with therapists and coaches when needed</li>
        </ul>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Important Note:</h4>
          <p className="text-blue-800 text-sm">
            This platform serves as a tool for reflection and practice, not as a source of spiritual authority. 
            Your own discernment, lived experience, and professional support when needed are always the 
            primary guides in your development.
          </p>
        </div>
      </div>
    </div>

    <div className="flex justify-end">
      <button
        onClick={onNext}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Continue
      </button>
    </div>
  </div>
);

const PersonalInfoStep: React.FC<{
  data: OnboardingData['personalInfo'];
  onChange: (data: Partial<OnboardingData['personalInfo']>) => void;
  onNext: () => void;
  onPrev: () => void;
}> = ({ data, onChange, onNext, onPrev }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Display Name *
        </label>
        <input
          type="text"
          value={data.displayName}
          onChange={(e) => onChange({ displayName: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="How would you like to be known in the community?"
        />
        <p className="text-xs text-gray-500 mt-1">
          This will be visible to other community members based on your privacy settings.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brief Bio (Optional)
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Share anything you'd like others to know about your journey or interests..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Background (Optional)
        </label>
        <input
          type="text"
          value={data.professionalBackground}
          onChange={(e) => onChange({ professionalBackground: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="If you're a professional in related fields..."
        />
        <p className="text-xs text-gray-500 mt-1">
          This helps us connect you with appropriate resources and opportunities.
        </p>
      </div>
    </div>

    <div className="flex justify-between">
      <button
        onClick={onPrev}
        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Back
      </button>
      <button
        onClick={onNext}
        disabled={!data.displayName.trim()}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Continue
      </button>
    </div>
  </div>
);

const DevelopmentAssessmentStep: React.FC<{
  data: OnboardingData['developmentAssessment'];
  onChange: (data: Partial<OnboardingData['developmentAssessment']>) => void;
  onNext: () => void;
  onPrev: () => void;
}> = ({ data, onChange, onNext, onPrev }) => {
  const challengeOptions = [
    'Stress and overwhelm',
    'Lack of clarity or direction',
    'Feeling disconnected from meaning',
    'Physical health concerns',
    'Emotional regulation difficulties',
    'Relationship challenges',
    'Work-life balance',
    'Spiritual questioning or crisis',
    'Life transitions',
    'Past trauma or grief'
  ];

  const supportOptions = [
    'Pattern recognition tools',
    'Daily practice development',
    'Community connection',
    'Professional guidance',
    'Reality-grounding techniques',
    'Integration support',
    'Accountability partnerships',
    'Contemplative skills development'
  ];

  const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Current Challenges
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          What areas of life are you currently navigating? (Select all that apply)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {challengeOptions.map(challenge => (
            <label key={challenge} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.currentChallenges.includes(challenge)}
                onChange={() => toggleArrayItem(
                  data.currentChallenges,
                  challenge,
                  (items) => onChange({ currentChallenges: items })
                )}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{challenge}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Support You're Seeking
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          What kind of support would be most helpful? (Select all that apply)
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supportOptions.map(support => (
            <label key={support} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.supportSought.includes(support)}
                onChange={() => toggleArrayItem(
                  data.supportSought,
                  support,
                  (items) => onChange({ supportSought: items })
                )}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{support}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Experience Level
        </h3>
        <div className="space-y-3">
          {[
            { value: 'beginner', label: 'New to personal development work', description: 'Just starting to explore growth practices' },
            { value: 'intermediate', label: 'Some experience with development practices', description: 'Familiar with basic concepts and practices' },
            { value: 'advanced', label: 'Experienced in personal development', description: 'Well-versed in various approaches and methods' }
          ].map(option => (
            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="experienceLevel"
                value={option.value}
                checked={data.experienceLevel === option.value}
                onChange={(e) => onChange({ experienceLevel: e.target.value })}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{option.label}</div>
                <div className="text-xs text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Professional Support
        </h3>
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.professionalSupportHistory}
            onChange={(e) => onChange({ professionalSupportHistory: e.target.checked })}
            className="mt-1 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">
              I have experience working with therapists, coaches, or spiritual directors
            </div>
            <div className="text-xs text-gray-600">
              This helps us understand your familiarity with professional support
            </div>
          </div>
        </label>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const PrivacySettingsStep: React.FC<{
  data: OnboardingData['privacySettings'];
  onChange: (data: Partial<OnboardingData['privacySettings']>) => void;
  onNext: () => void;
  onPrev: () => void;
}> = ({ data, onChange, onNext, onPrev }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Community Visibility
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        How would you like to participate in the community?
      </p>
      <div className="space-y-3">
        {[
          { 
            value: 'private', 
            label: 'Private', 
            description: 'Keep your journey private, no community interaction' 
          },
          { 
            value: 'supportive', 
            label: 'Supportive Community', 
            description: 'Share with others focused on mutual support and growth' 
          },
          { 
            value: 'open', 
            label: 'Open Community', 
            description: 'Full community participation and public sharing' 
          }
        ].map(option => (
          <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
            <input
              type="radio"
              name="communityVisibility"
              value={option.value}
              checked={data.communityVisibility === option.value}
              onChange={(e) => onChange({ communityVisibility: e.target.value as any })}
              className="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">{option.label}</div>
              <div className="text-xs text-gray-600">{option.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>

    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Professional Support Integration
      </h3>
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.professionalSupportConsent}
          onChange={(e) => onChange({ professionalSupportConsent: e.target.checked })}
          className="mt-1 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <div className="text-sm font-medium text-gray-900">
            Allow connection with professional support providers
          </div>
          <div className="text-xs text-gray-600">
            Enable referrals to therapists, coaches, or other professionals when patterns suggest benefit
          </div>
        </div>
      </label>
    </div>

    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Research Participation
      </h3>
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={data.researchParticipation}
          onChange={(e) => onChange({ researchParticipation: e.target.checked })}
          className="mt-1 text-blue-600 focus:ring-blue-500"
        />
        <div>
          <div className="text-sm font-medium text-gray-900">
            Contribute anonymized data for research
          </div>
          <div className="text-xs text-gray-600">
            Help improve integration-centered approaches through anonymous research data
          </div>
        </div>
      </label>
    </div>

    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Data Retention Preference
      </h3>
      <select
        value={data.dataRetentionPreference}
        onChange={(e) => onChange({ dataRetentionPreference: Number(e.target.value) })}
        className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value={1}>1 year</option>
        <option value={3}>3 years</option>
        <option value={5}>5 years</option>
        <option value={10}>10 years</option>
        <option value={-1}>Indefinite (until I request deletion)</option>
      </select>
      <p className="text-xs text-gray-500 mt-1">
        How long would you like us to retain your data?
      </p>
    </div>

    <div className="flex justify-between">
      <button
        onClick={onPrev}
        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Back
      </button>
      <button
        onClick={onNext}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Continue
      </button>
    </div>
  </div>
);

const IntegrationCommitmentStep: React.FC<{
  data: OnboardingData['integrationCommitment'];
  onChange: (data: Partial<OnboardingData['integrationCommitment']>) => void;
  onNext: () => void;
  onPrev: () => void;
}> = ({ data, onChange, onNext, onPrev }) => {
  const commitments = [
    {
      key: 'reflectionPeriodConsent',
      title: 'Reflection Periods',
      description: 'I understand that there will be mandatory waiting periods between accessing new content to allow for integration.',
      required: true
    },
    {
      key: 'realityCheckingConsent',
      title: 'Reality Grounding',
      description: 'I consent to receiving prompts that ground spiritual concepts in daily reality and human experience.',
      required: true
    },
    {
      key: 'communityAccountabilityConsent',
      title: 'Community Accountability',
      description: 'I am open to community feedback and reality-checking to support authentic development.',
      required: false
    },
    {
      key: 'professionalReferralConsent',
      title: 'Professional Referrals',
      description: 'I consent to receiving professional support referrals when patterns suggest therapeutic benefit.',
      required: false
    }
  ];

  const allRequiredConsents = commitments
    .filter(c => c.required)
    .every(c => data[c.key as keyof typeof data]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Integration-Centered Approach
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Our platform is designed to prevent spiritual bypassing and support embodied development. 
          Please review and consent to our approach:
        </p>

        <div className="space-y-4">
          {commitments.map(commitment => (
            <div key={commitment.key} className="border border-gray-200 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data[commitment.key as keyof typeof data]}
                  onChange={(e) => onChange({ [commitment.key]: e.target.checked })}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {commitment.title}
                    </span>
                    {commitment.required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Required
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {commitment.description}
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="font-medium text-amber-900 mb-2">
          Important Understanding
        </h4>
        <p className="text-sm text-amber-800">
          This platform supports your development process but cannot replace professional mental health care, 
          medical advice, or spiritual direction. We encourage maintaining relationships with qualified 
          professionals as appropriate for your individual needs.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!allRequiredConsents}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

const CompletionStep: React.FC<{
  onComplete: () => void;
  onPrev: () => void;
}> = ({ onComplete, onPrev }) => (
  <div className="space-y-6 text-center">
    <div className="mb-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        Welcome to Your Integration Journey
      </h3>
      <p className="text-gray-600">
        Your platform is configured to support sustainable, embodied development
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">🌱 What Happens Next</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Begin with foundational assessment</li>
          <li>• Start your first integration period</li>
          <li>• Connect with supportive community</li>
          <li>• Establish daily practice rhythms</li>
        </ul>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">💫 Remember</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Growth is spiral, not linear</li>
          <li>• Integration takes time</li>
          <li>• Community supports your journey</li>
          <li>• Your discernment is paramount</li>
        </ul>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h4 className="font-medium text-blue-900 mb-2">
        Ready to Begin?
      </h4>
      <p className="text-sm text-blue-800 mb-4">
        Your integration-centered development platform is now ready. Take your time, 
        honor your process, and remember that sustainable growth happens through 
        consistency rather than intensity.
      </p>
    </div>

    <div className="flex justify-between">
      <button
        onClick={onPrev}
        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Back
      </button>
      <button
        onClick={onComplete}
        className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        Enter Platform
      </button>
    </div>
  </div>
);