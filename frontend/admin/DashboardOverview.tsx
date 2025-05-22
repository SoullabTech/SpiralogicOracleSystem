import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  UsersIcon,
  ClockIcon,
  ServerIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { getSystemMetrics } from '../../services/adminService';
import { AskOracle } from './AskOracle';
import { useAuth } from '../../lib/auth';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function DashboardOverview() {
  const { currentUser } = useAuth();
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['systemMetrics'],
    queryFn: getSystemMetrics,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Active Users',
      value: metrics?.currentActiveUsers || 0,
      change: '+4.75%',
      changeType: 'positive',
      icon: UsersIcon,
    },
    {
      name: 'Avg. Response Time',
      value: `${metrics?.avgResponseTime || 0}ms`,
      change: '-1.39%',
      changeType: 'negative',
      icon: ClockIcon,
    },
    {
      name: 'Memory Usage',
      value: `${metrics?.memoryUsage || 0}%`,
      change: '+2.45%',
      changeType: 'positive',
      icon: ServerIcon,
    },
    {
      name: 'System Load',
      value: metrics?.systemLoad || '0.45',
      change: '-3.02%',
      changeType: 'negative',
      icon: BoltIcon,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-sm text-gray-700">
          Last updated: {format(new Date(), 'PPpp')}
        </p>
      </div>

      <div>
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className="absolute rounded-md bg-indigo-500 p-3">
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                <p
                  className={classNames(
                    item.changeType === 'positive' ? 'text-green-600' : 'text-red-600',
                    'ml-2 flex items-baseline text-sm font-semibold'
                  )}
                >
                  {item.changeType === 'positive' ? (
                    <ArrowUpIcon className="h-5 w-5 flex-shrink-0 self-center text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5 flex-shrink-0 self-center text-red-500" />
                  )}
                  <span className="sr-only">
                    {item.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                  </span>
                  {item.change}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Response Time Distribution
          </h2>
          {/* Add response time chart */}
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Memory Usage Trend
          </h2>
          {/* Add memory usage chart */}
        </div>
      </div>

      {/* 🧠 Oracle Input */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Ask the Oracle</h2>
        <AskOracle userId={currentUser.id} />
      </div>
    </div>
  );
}
