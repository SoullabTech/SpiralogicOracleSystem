import { RecapView } from '@/components/recap/RecapView';

export default function DevRecapPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-ink-100 text-xl">Recap Demo</h1>

      {/* A) Live weave (replace with real IDs in runtime or via router) */}
      <RecapView source={{ mode: 'weave', conversationId: 'CURRENT_CONVO' }} />

      {/* B) Props demo */}
      <RecapView
        source={{
          mode: 'props',
          recap: {
            themes:  ['Letting go of old roles while sensing new possibilities.'],
            emotions:['A depth of feeling around renewal and grief; openness to change.'],
            steps:   ['Block 20 minutes daily for breath + walking.', 'List 3 supportive boundaries at work.'],
            ideas:   ['Reframe "starting over" as "composting"—nutrients for the next season.'],
            energy:  ['Creative spark shows up after deep rest — protect the margins.'],
            timestamp: new Date().toISOString(),
            quote: 'I feel something new is trying to come through, but I keep clinging to the old.',
          },
        }}
      />
    </div>
  );
}