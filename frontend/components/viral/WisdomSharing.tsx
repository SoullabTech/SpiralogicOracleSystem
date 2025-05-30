'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Heart, Download, Copy, Check, Star, Sparkles } from 'lucide-react';

interface WisdomSharingProps {
  insight: string;
  context?: string;
  mode?: string;
  onShare?: (platform: string) => void;
  onClose?: () => void;
}

export const WisdomSharing: React.FC<WisdomSharingProps> = ({
  insight,
  context,
  mode,
  onShare,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState('cosmic');

  const backgrounds = {
    cosmic: 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900',
    earth: 'bg-gradient-to-br from-amber-900 via-orange-900 to-red-900',
    water: 'bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900',
    sacred: 'bg-gradient-to-br from-amber-800 via-yellow-800 to-orange-800'
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(insight);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: string) => {
    const shareText = `"${insight}"\n\n✨ From my consciousness journey with Sacred Technology`;
    const shareUrl = encodeURIComponent(shareText);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${shareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${shareUrl}`,
      instagram: '', // Instagram doesn't support direct URL sharing
      pinterest: `https://pinterest.com/pin/create/button/?description=${shareUrl}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
    
    onShare?.(platform);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="premium-sacred-card max-w-2xl w-full p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-soullab-fire/20 to-soullab-water/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-soullab-fire" />
          </div>
          <h2 className="premium-heading-2 mb-2">Share Your Wisdom</h2>
          <p className="premium-body">
            Your insight might be exactly what another soul needs to hear
          </p>
        </div>

        {/* Wisdom Card Preview */}
        <div className="mb-8">
          <div className={`${backgrounds[selectedBackground]} p-8 rounded-lg text-white relative overflow-hidden`}>
            {/* Sacred Geometry Background */}
            <div className="absolute inset-0 opacity-10">
              <div className="sacred-geometry-subtle" />
            </div>
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <blockquote className="text-xl md:text-2xl font-light mb-6 leading-relaxed">
                "{insight}"
              </blockquote>
              
              <div className="flex items-center justify-center gap-2 text-sm opacity-80">
                <Star className="w-4 h-4" />
                <span>Shared from a consciousness journey</span>
                <Star className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Background Selection */}
          <div className="flex gap-2 mt-4 justify-center">
            {Object.entries(backgrounds).map(([key, bgClass]) => (
              <button
                key={key}
                onClick={() => setSelectedBackground(key)}
                className={`w-8 h-8 rounded-full ${bgClass} border-2 transition-all ${
                  selectedBackground === key ? 'border-soullab-fire scale-110' : 'border-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Sharing Options */}
        <div className="space-y-6">
          {/* Copy to Clipboard */}
          <div className="text-center">
            <button
              onClick={handleCopy}
              className="premium-sacred-button mb-4"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          {/* Social Platforms */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleShare('twitter')}
              className="premium-sacred-card p-4 text-center hover:bg-blue-500/10 transition-colors"
            >
              <div className="text-2xl mb-2">🐦</div>
              <div className="premium-body text-sm">Twitter</div>
            </button>
            
            <button
              onClick={() => handleShare('facebook')}
              className="premium-sacred-card p-4 text-center hover:bg-blue-600/10 transition-colors"
            >
              <div className="text-2xl mb-2">📘</div>
              <div className="premium-body text-sm">Facebook</div>
            </button>
            
            <button
              onClick={() => handleShare('pinterest')}
              className="premium-sacred-card p-4 text-center hover:bg-red-500/10 transition-colors"
            >
              <div className="text-2xl mb-2">📌</div>
              <div className="premium-body text-sm">Pinterest</div>
            </button>
            
            <button
              onClick={() => handleShare('instagram')}
              className="premium-sacred-card p-4 text-center hover:bg-pink-500/10 transition-colors"
            >
              <div className="text-2xl mb-2">📷</div>
              <div className="premium-body text-sm">Stories</div>
            </button>
          </div>

          {/* Gentle Message */}
          <div className="text-center">
            <p className="premium-body text-sm italic">
              <span className="sacred-text">Sacred note:</span> Your wisdom might plant a seed of awakening in another heart. 
              Share when it feels right, not because you feel you should.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="text-center mt-8">
          <button
            onClick={onClose}
            className="premium-sacred-button-secondary"
          >
            <span>Keep This Private</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default WisdomSharing;