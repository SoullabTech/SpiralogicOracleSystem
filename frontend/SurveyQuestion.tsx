import { useState } from 'react';

interface SurveyQuestionProps {
  id: string;
  text: string;
  element: string;
  onAnswer: (questionId: string, answer: number) => void;
  currentAnswer?: number;
}

export function SurveyQuestion({ id, text, element, onAnswer, currentAnswer }: SurveyQuestionProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire':
        return 'bg-red-500';
      case 'water':
        return 'bg-blue-500';
      case 'earth':
        return 'bg-green-500';
      case 'air':
        return 'bg-yellow-500';
      case 'aether':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">{text}</h3>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Strongly Disagree</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => onAnswer(id, rating)}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(null)}
              className={`w-12 h-12 rounded-full transition-all ${
                currentAnswer === rating
                  ? `${getElementColor(element)} text-white`
                  : hoveredRating && hoveredRating >= rating
                  ? `${getElementColor(element)} bg-opacity-50 text-white`
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">Strongly Agree</span>
      </div>
    </div>
  );
}