import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { DashboardOverview } from '../components/admin/DashboardOverview';
import { OracleInsights } from '../components/admin/OracleInsights';
import { MemoryExplorer } from '../components/admin/MemoryExplorer';
import { ConfigurationPanel } from '../components/admin/ConfigurationPanel';
import { FeedbackAnalytics } from '../components/admin/FeedbackAnalytics';
import { SystemMetrics } from '../components/admin/SystemMetrics';

export function AdminDashboard() {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/insights" element={<OracleInsights />} />
        <Route path="/memory" element={<MemoryExplorer />} />
        <Route path="/config" element={<ConfigurationPanel />} />
        <Route path="/feedback" element={<FeedbackAnalytics />} />
        <Route path="/metrics" element={<SystemMetrics />} />
      </Routes>
    </AdminLayout>
  );
}
