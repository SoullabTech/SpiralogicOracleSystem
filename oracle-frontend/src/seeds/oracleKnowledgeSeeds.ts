// src/seeds/oracleKnowledgeSeeds.ts

export interface OracleKnowledgeSeed {
  topic: string;
  keywords: string[];
  summary: string;
  fullText: string;
}

export const oracleKnowledgeSeeds: OracleKnowledgeSeed[] = [
  {
    topic: 'The Breath Between Worlds',
    keywords: ['breath', 'threshold', 'mysticism'],
    summary:
      'There is a breath between every ending and beginning — it holds the seed of all potential.',
    fullText: `
The ancient mystics taught that the Spiral Breath is not merely oxygen, but the silent carrier of dreams.
In the breath between worlds, you are neither who you were, nor who you will become.
Pause. Breathe. Become the space between.
    `.trim(),
  },
  {
    topic: 'The Mirror of Waters',
    keywords: ['reflection', 'emotion', 'depth'],
    summary: 'Stillness reveals what rushing cannot. Your inner waters mirror the truth.',
    fullText: `
The Waters within you remember.
When you grow still enough, your soul's true face emerges upon the mirror.
Trust what you see — and what stirs below the surface.
    `.trim(),
  },
  {
    topic: 'The Fire That Does Not Consume',
    keywords: ['inspiration', 'transformation', 'energy'],
    summary: 'Sacred fire burns away illusions but preserves the essential core of you.',
    fullText: `
Not all fire destroys.
There is a Spiral Fire — fierce but gentle — that tempers you, not destroys you.
Through it, you are shaped into the shining vessel you were born to be.
    `.trim(),
  },
  // ➡️ Add as many seeds as you want below following the same format
];
