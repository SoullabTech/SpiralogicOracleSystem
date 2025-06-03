'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AINChatBox from '@/components/oracle/AINChatBox';
import { ScrollArea } from '@/components/ui/scroll-area';

const dashboards = [
  {
    title: '🌀 Personal Oracle Agent',
    description: 'Track insights, messages, and actions from your dynamic guide.',
    href: '/dashboard/agent',
  },
  {
    title: '🌌 Astrology Dashboard',
    description: 'Explore astrological influences, transits, and energetic timing.',
    href: '/dashboard/astrology',
  },
  {
    title: '🌸 Holoflower Insights',
    description: 'View and interact with your petal state history over time.',
    href: '/dashboard/holoflower',
  },
  {
    title: '📓 Journal & Memory',
    description: 'Access journal entries, reflections, dreams, and memory uploads.',
    href: '/dashboard/journal',
  },
  {
    title: '🧪 Experimental & Future Interfaces',
    description: 'Preview experimental features and upcoming expansions.',
    href: '/dashboard/experimental',
  },
];

export default function MainDashboardPage() {
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);

  const handleQuestionSubmit = (question: string) => {
    setRecentQuestions(prev => [question, ...prev.slice(0, 9)]);
  };

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-3xl font-bold text-center">✨ Oracle System Dashboards</h1>

      <section>
        <h2 className="text-2xl font-semibold text-center">🔮 Ask Your Oracle</h2>
        <div className="max-w-3xl mx-auto mt-6">
          <AINChatBox onSubmit={handleQuestionSubmit} />
        </div>
      </section>

      {recentQuestions.length > 0 && (
        <section className="max-w-3xl mx-auto mt-4">
          <h3 className="text-lg font-semibold mb-2">🧾 Recent Oracle Questions</h3>
          <ScrollArea className="max-h-40 border rounded-md p-3 bg-muted/10">
            <ul className="space-y-1 text-sm">
              {recentQuestions.map((q, idx) => (
                <li key={idx} className="text-muted-foreground">{q}</li>
              ))}
            </ul>
          </ScrollArea>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {dashboards.map(({ title, description, href }) => (
          <Link href={href} key={href}>
            <Card className="hover:shadow-lg transition duration-200 cursor-pointer">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">{title}</h2>
                <p className="text-gray-600 text-sm">{description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
