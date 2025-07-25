import Link from 'next/link';

const dashboards = [
  {
    title: '🔥 Oracle Beta Testing',
    description: 'Test real Fire/Water/Earth/Air agents with consciousness technology.',
    href: '/dashboard/oracle-beta',
    badge: 'BETA'
  },
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
    title: '🪷 Taoist Elemental Alchemy',
    description: 'Discover your Five-Element chart and Taoist practice path.',
    href: '/dashboard/taoist-elements',
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

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔮 Sacred Technology Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access your personalized oracle interfaces, elemental insights, and consciousness exploration tools
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dashboards.map((dashboard, index) => (
            <Link
              key={index}
              href={dashboard.href}
              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden relative"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {dashboard.title}
                  </h3>
                  {'badge' in dashboard && (
                    <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                      {dashboard.badge}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {dashboard.description}
                </p>
                
                {/* Hover indicator */}
                <div className="mt-4 flex items-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Explore</span>
                  <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              
              {/* Gradient border effect */}
              <div className="h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-16 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            ⚡ Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all transform hover:scale-105">
              🎯 Daily Check-in
            </button>
            
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105">
              🌙 Dream Journal
            </button>
            
            <button className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all transform hover:scale-105">
              🔮 Oracle Reading
            </button>
            
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105">
              🧘 Start Ritual
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            📈 Recent Activity
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-purple-600">🌀</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Oracle Reading Completed</p>
                <p className="text-sm text-gray-600">Received guidance on creative projects • 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600">🪷</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Taoist Practice Session</p>
                <p className="text-sm text-gray-600">15-minute Water element meditation • Yesterday</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-indigo-600">📓</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Journal Entry Added</p>
                <p className="text-sm text-gray-600">Morning reflection on creative flow • 2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}