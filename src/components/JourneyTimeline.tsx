import React from 'react';
import { Memory } from '../lib/memory';
import { Clock, Star, Lightbulb, Target } from 'lucide-react';

interface JourneyTimelineProps {
  memories: Memory[];
  onMemoryClick: (memory: Memory) => void;
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  memories,
  onMemoryClick
}) => {
  const sortedMemories = [...memories].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  const groupedMemories = groupMemoriesByDate(sortedMemories);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 border-b pb-4 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <Clock className="text-indigo-600" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Journey Timeline</h2>
          <p className="text-sm text-gray-500">Your transformation path</p>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedMemories).map(([date, dayMemories]) => (
          <div key={date} className="relative">
            <div className="sticky top-0 bg-white z-10 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Target className="text-gray-600" size={16} />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {formatDate(new Date(date))}
              </span>
            </div>

            <div className="space-y-4 pl-4 border-l-2 border-gray-100">
              {dayMemories.map((memory) => (
                <div
                  key={memory.id}
                  onClick={() => onMemoryClick(memory)}
                  className="relative cursor-pointer group"
                >
                  <div className="absolute -left-[21px] top-2 w-4 h-4 rounded-full bg-white border-2 border-gray-200 group-hover:border-purple-500 transition-colors" />
                  
                  <div className="ml-4 p-4 rounded-lg bg-gray-50 group-hover:bg-purple-50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      {memory.type === 'insight' ? (
                        <Lightbulb size={14} className="text-amber-500" />
                      ) : (
                        <Star size={14} className="text-purple-500" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {memory.type}
                      </span>
                      {memory.metadata.element && (
                        <span className="text-xs bg-white px-2 py-1 rounded border">
                          {memory.metadata.element}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {memory.content}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>{memory.timestamp.toLocaleTimeString()}</span>
                      <span>Strength: {Math.round(memory.strength * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function groupMemoriesByDate(memories: Memory[]): Record<string, Memory[]> {
  const groups: Record<string, Memory[]> = {};
  
  memories.forEach(memory => {
    const date = memory.timestamp.toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(memory);
  });
  
  return groups;
}

function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
}