/**
 * AIN Amber Navigation Configuration
 * Ensures all navigation leads to sacred amber-themed pages
 */

export const navigationConfig = {
  // Primary navigation routes
  primary: {
    voice: '/maya-voice',
    chat: '/maya',
    journal: '/journal',
    about: '/about',
    monitor: '/beta/monitor'
  },

  // Redirects from old purple/energy interfaces
  redirects: {
    '/holoflower': '/journal',
    '/energix': '/maya',
    '/radiant': '/maya-voice',
    '/energy-wheel': '/journal',
    '/daily-check': '/journal',
    '/check-in': '/journal',
    '/ritual': '/maya',
    '/oracle-conversation': '/maya',
    '/spiralogic': '/maya',
    '/healing': '/maya',
    '/soulmap': '/about'
  },

  // PWA menu configuration (AIN Amber theme)
  pwaMenu: [
    {
      label: 'Voice',
      path: '/maya-voice',
      icon: '🎤',
      description: 'Sacred voice exchange with Maya'
    },
    {
      label: 'Chat',
      path: '/maya',
      icon: '💬',
      description: 'Text conversation with Maya'
    },
    {
      label: 'Journal',
      path: '/journal',
      icon: '📖',
      description: 'Sacred journal & reflection'
    },
    {
      label: 'About',
      path: '/about',
      icon: '✨',
      description: 'Learn about Soullab'
    },
    {
      label: 'Monitor',
      path: '/beta/monitor',
      icon: '📊',
      description: 'Maya evolution tracking'
    }
  ],

  // Theme colors (AIN Amber)
  theme: {
    primary: '#F6AD55', // Amber
    secondary: '#D4B896', // Light amber
    background: '#1a1f3a', // Deep blue-black
    accent: '#FFD700', // Gold
    text: '#E8E3D3', // Cream
    sacred: '#D4AF37' // Sacred gold
  }
};