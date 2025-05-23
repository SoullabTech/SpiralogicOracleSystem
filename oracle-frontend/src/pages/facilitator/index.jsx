import AdjusterAgentDashboard from '../../components/dashboards/AdjusterAgentDashboard';

export default function FacilitatorPage() {
  return (
    <div className="dark bg-soullab-twilight min-h-screen p-6 font-soullab text-soullab-mist">
      <h1 className="text-3xl font-bold text-soullab-gold mb-6 animate-fade-in">
        Facilitator Dashboard
      </h1>
      <AdjusterAgentDashboard />
    </div>
  );
}
