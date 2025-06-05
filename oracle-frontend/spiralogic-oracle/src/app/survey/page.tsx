'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Question {
  id: string;
  text: string;
  element: string;
}

export default function SurveyPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('survey_questions')
        .select('*');
      if (data) setQuestions(data);
      if (error) console.error(error);
    };
    fetchQuestions();
  }, []);

  const handleAnswer = (id: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    const userId = 'demo-user'; // TODO: Replace with actual Supabase user auth

    const responses = Object.entries(answers).map(([question_id, answer]) => ({
      user_id: userId,
      question_id,
      answer,
    }));

    // Save responses to Supabase
    const { error } = await supabase
      .from('survey_responses')
      .insert(responses);

    if (error) {
      console.error("Error saving survey responses:", error.message);
      return;
    }

    // Now generate elemental profile from those responses
    const profileResponse = await fetch('/api/generate-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!profileResponse.ok) {
      console.error("Failed to generate profile");
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-oracle mb-6">🧭 Elemental Calibration</h1>
      {submitted ? (
        <p className="text-green-600">✨ Survey saved and profile generated!</p>
      ) : (
        <>
          {questions.map((q) => (
            <div key={q.id} className="mb-4">
              <p className="font-semibold">{q.text}</p>
              <input
                type="range"
                min="1"
                max="5"
                value={answers[q.id] || 3}
                onChange={(e) => handleAnswer(q.id, Number(e.target.value))}
              />
              <span className="ml-2">{answers[q.id] || 3}</span>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="mt-6 px-4 py-2 bg-gold text-deep-purple font-bold rounded"
          >
            Submit Survey
          </button>
        </>
      )}
    </div>
  );
}
