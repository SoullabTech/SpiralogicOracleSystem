/**
 * Admin Dashboard - Overview
 */
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Beta launch monitoring and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          href="/admin/analytics" 
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border"
        >
          <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
          <p className="text-gray-600 mt-2">User engagement and system metrics</p>
        </Link>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900">User Feedback</h3>
          <p className="text-gray-600 mt-2">Beta tester responses and insights</p>
          <p className="text-sm text-yellow-600 mt-2">Coming soon</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
          <p className="text-gray-600 mt-2">Server status and performance</p>
          <p className="text-sm text-yellow-600 mt-2">Coming soon</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900">Beta Launch Status</h4>
        <p className="text-blue-800 text-sm mt-1">
          System deployed and ready for first wave testing. 
          Memory features temporarily disabled for smooth launch.
        </p>
      </div>
    </div>
  );
}