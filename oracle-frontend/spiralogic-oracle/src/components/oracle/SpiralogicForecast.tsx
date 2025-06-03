'use client';

import { useState, useEffect } from 'react';

interface ElementalTrend {
  element: string;
  current: number;
  forecast: number;
  trend: 'rising' | 'falling' | 'stable';
  color: string;
  symbol: string;
}

export default function SpiralogicForecast() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '3m'>('7d');
  const [isAnimating, setIsAnimating] = useState(false);

  const elementalData: ElementalTrend[] = [
    { 
      element: 'Fire', 
      current: 72, 
      forecast: 85, 
      trend: 'rising',
      color: 'from-orange-400 to-red-500',
      symbol: '🔥'
    },
    { 
      element: 'Water', 
      current: 45, 
      forecast: 40, 
      trend: 'falling',
      color: 'from-blue-400 to-cyan-500',
      symbol: '💧'
    },
    { 
      element: 'Earth', 
      current: 68, 
      forecast: 70, 
      trend: 'stable',
      color: 'from-green-400 to-emerald-500',
      symbol: '🌍'
    },
    { 
      element: 'Air', 
      current: 58, 
      forecast: 65, 
      trend: 'rising',
      color: 'from-sky-300 to-purple-400',
      symbol: '💨'
    },
    { 
      element: 'Aether', 
      current: 82, 
      forecast: 78, 
      trend: 'falling',
      color: 'from-purple-400 to-violet-600',
      symbol: '✨'
    }
  ];

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [selectedTimeframe]);

  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '3m', label: '3 Months' }
  ];

  const getTrendIcon = (trend: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising': return '↗️';
      case 'falling': return '↘️';
      case 'stable': return '→';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Elemental Forecast
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Tracking cosmic elemental energies
          </p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setSelectedTimeframe(tf.value as any)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedTimeframe === tf.value
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Elemental Trends Grid */}
      <div className="grid gap-4">
        {elementalData.map((element, index) => (
          <div
            key={element.element}
            className={`relative overflow-hidden rounded-lg p-4 bg-white dark:bg-slate-800 shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-[1.02] ${
              isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
            style={{ 
              transitionDelay: `${index * 100}ms`,
              animation: isAnimating ? 'slideIn 0.5s ease-out forwards' : 'none',
              animationDelay: `${index * 100}ms`
            }}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${element.color}`} />
            
            <div className="relative z-10">
              {/* Element Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{element.symbol}</span>
                  <h3 className="font-semibold text-lg">{element.element}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTrendIcon(element.trend)}</span>
                  <span className={`text-sm font-medium ${
                    element.trend === 'rising' ? 'text-green-600' : 
                    element.trend === 'falling' ? 'text-red-600' : 
                    'text-yellow-600'
                  }`}>
                    {element.trend === 'rising' ? '+' : element.trend === 'falling' ? '-' : ''}
                    {Math.abs(element.forecast - element.current)}%
                  </span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2">
                {/* Current Level */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Current</span>
                    <span className="font-medium">{element.current}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${element.color} transition-all duration-1000 ease-out rounded-full`}
                      style={{ 
                        width: isAnimating ? '0%' : `${element.current}%`,
                        transitionDelay: `${index * 100 + 300}ms`
                      }}
                    />
                  </div>
                </div>

                {/* Forecast Level */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Forecast</span>
                    <span className="font-medium">{element.forecast}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${element.color} opacity-60 transition-all duration-1000 ease-out rounded-full`}
                      style={{ 
                        width: isAnimating ? '0%' : `${element.forecast}%`,
                        transitionDelay: `${index * 100 + 500}ms`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Message */}
      <div className="text-center py-4 px-6 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-medium">Cosmic Insight:</span> Your elemental balance is shifting towards transformation.
          Embrace the rising Fire and Air energies for creative breakthroughs.
        </p>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}