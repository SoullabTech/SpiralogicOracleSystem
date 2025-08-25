import OracleVoiceInterface from '@/components/voice/OracleVoiceInterface';

export default function VoiceDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="container mx-auto">
        <OracleVoiceInterface />
      </div>
    </div>
  );
}