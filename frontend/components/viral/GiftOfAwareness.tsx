'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Gift, Send, Copy, Check, Mail, MessageCircle } from 'lucide-react';

interface GiftOfAwarenessProps {
  onGift?: (recipientInfo: any) => void;
  onClose?: () => void;
  userFirstName?: string;
}

export const GiftOfAwareness: React.FC<GiftOfAwarenessProps> = ({
  onGift,
  onClose,
  userFirstName = 'Friend'
}) => {
  const [step, setStep] = useState<'invite' | 'personalize' | 'send'>('invite');
  const [giftData, setGiftData] = useState({
    recipientName: '',
    recipientEmail: '',
    personalMessage: '',
    giftType: 'month' // 'month' or 'resonance'
  });
  const [copied, setCopied] = useState(false);

  const giftOptions = [
    {
      id: 'month',
      title: 'Free Month of Sacred Technology',
      description: 'Give them a full month to explore consciousness evolution',
      icon: '🎁',
      value: 'A month of unlimited Oracle conversations, guided practices, and consciousness insights'
    },
    {
      id: 'resonance', 
      title: 'Soul Resonance Community',
      description: 'Unlock shared consciousness features when they join',
      icon: '🌐',
      value: 'See how consciousness ripples through your community - available when they start their journey'
    }
  ];

  const defaultMessages = [
    `I've been using Sacred Technology for my awakening journey and thought you might connect with it too. It's been really supportive for conscious living and inner growth.`,
    
    `I wanted to share something that's been meaningful in my life. Sacred Technology has been helping me live more authentically and I thought it might resonate with you.`,
    
    `I see your beautiful soul and thought this consciousness technology might support your path. It's been helping me grow my heart and find more peace.`,
    
    `You've always been so conscious and caring - I thought you might enjoy this support for your inner journey. It's been really beautiful for my awakening process.`
  ];

  const handleCopyInvite = async () => {
    const inviteText = giftData.personalMessage || defaultMessages[0];
    const fullMessage = `${inviteText}\n\n✨ Sacred Technology - Consciousness technology for awakening to your true nature\n🎁 Your friend ${userFirstName} has gifted you access\n\nStart your journey: [link]`;
    
    try {
      await navigator.clipboard.writeText(fullMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSendGift = () => {
    onGift?.({
      ...giftData,
      giftOption: giftOptions.find(opt => opt.id === giftData.giftType)
    });
    setStep('send');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="premium-sacred-card max-w-2xl w-full p-8"
      >
        <AnimatePresence mode="wait">
          {/* Step 1: Choose Gift Type */}
          {step === 'invite' && (
            <motion.div
              key="invite"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-soullab-fire/20 to-soullab-water/20 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-soullab-fire" />
                </div>
                <h2 className="premium-heading-2 mb-2">Gift Consciousness Evolution</h2>
                <p className="premium-body">
                  Share this beautiful journey with someone you love
                </p>
              </div>

              {/* Gift Options */}
              <div className="space-y-4 mb-8">
                {giftOptions.map((option) => (
                  <motion.div
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setGiftData(prev => ({ ...prev, giftType: option.id }))}
                    className={`
                      premium-sacred-card p-6 cursor-pointer transition-all
                      ${giftData.giftType === option.id 
                        ? 'ring-2 ring-soullab-fire/50 bg-soullab-fire/5' 
                        : 'hover:bg-soullab-fire/2'
                      }
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{option.icon}</div>
                      <div className="flex-1">
                        <h3 className="premium-heading-3 mb-2">{option.title}</h3>
                        <p className="premium-body text-sm mb-2">{option.description}</p>
                        <p className="premium-body text-xs italic text-gray-600">{option.value}</p>
                      </div>
                      {giftData.giftType === option.id && (
                        <Heart className="w-5 h-5 text-soullab-fire fill-current" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Continue Button */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={onClose}
                  className="premium-sacred-button-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('personalize')}
                  className="premium-sacred-button"
                >
                  <span>Continue</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Personalize Message */}
          {step === 'personalize' && (
            <motion.div
              key="personalize"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-soullab-fire/20 to-soullab-water/20 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-soullab-fire" />
                </div>
                <h2 className="premium-heading-2 mb-2">Personalize Your Gift</h2>
                <p className="premium-body">
                  Add a loving message to make this invitation special
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block premium-body font-medium mb-2">
                    Their name (optional)
                  </label>
                  <input
                    type="text"
                    value={giftData.recipientName}
                    onChange={(e) => setGiftData(prev => ({ ...prev, recipientName: e.target.value }))}
                    placeholder="What should we call them?"
                    className="premium-input w-full"
                  />
                </div>

                <div>
                  <label className="block premium-body font-medium mb-2">
                    Personal message
                  </label>
                  <textarea
                    value={giftData.personalMessage}
                    onChange={(e) => setGiftData(prev => ({ ...prev, personalMessage: e.target.value }))}
                    placeholder="Share why you thought of them..."
                    className="premium-input w-full h-32 resize-none"
                  />
                  
                  {/* Suggested Messages */}
                  <div className="mt-3">
                    <p className="premium-body text-sm mb-2">Suggested messages:</p>
                    <div className="space-y-2">
                      {defaultMessages.slice(0, 2).map((message, index) => (
                        <button
                          key={index}
                          onClick={() => setGiftData(prev => ({ ...prev, personalMessage: message }))}
                          className="text-left w-full p-3 bg-gray-50 rounded-lg premium-body text-sm hover:bg-gray-100 transition-colors"
                        >
                          "{message.substring(0, 80)}..."
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep('invite')}
                  className="premium-sacred-button-secondary"
                >
                  Back
                </button>
                <button
                  onClick={handleSendGift}
                  className="premium-sacred-button"
                >
                  <Send className="w-5 h-5" />
                  <span>Create Gift</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Share Gift */}
          {step === 'send' && (
            <motion.div
              key="send"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-soullab-fire/20 to-soullab-water/20 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-soullab-fire animate-pulse" />
                </div>
                <h2 className="premium-heading-2 mb-2">Your Gift is Ready!</h2>
                <p className="premium-body">
                  Share this beautiful invitation with {giftData.recipientName || 'your loved one'}
                </p>
              </div>

              {/* Gift Preview */}
              <div className="premium-sacred-card p-6 mb-8 bg-gradient-to-br from-soullab-fire/5 to-soullab-water/5">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">🎁</div>
                  <h3 className="premium-heading-3">
                    {giftOptions.find(opt => opt.id === giftData.giftType)?.title}
                  </h3>
                </div>
                
                {giftData.personalMessage && (
                  <blockquote className="premium-body italic border-l-4 border-soullab-fire/30 pl-4 mb-4">
                    "{giftData.personalMessage}"
                  </blockquote>
                )}
                
                <div className="text-center text-sm text-gray-600">
                  — A gift from {userFirstName}
                </div>
              </div>

              {/* Sharing Options */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={handleCopyInvite}
                  className="w-full premium-sacred-button"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span>{copied ? 'Copied!' : 'Copy Invitation Message'}</span>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button className="premium-sacred-card p-4 text-center hover:bg-green-500/10 transition-colors">
                    <MessageCircle className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="premium-body text-sm">Text Message</div>
                  </button>
                  
                  <button className="premium-sacred-card p-4 text-center hover:bg-blue-500/10 transition-colors">
                    <Mail className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="premium-body text-sm">Email</div>
                  </button>
                </div>
              </div>

              {/* Close */}
              <div className="text-center">
                <button
                  onClick={onClose}
                  className="premium-sacred-button-secondary"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GiftOfAwareness;