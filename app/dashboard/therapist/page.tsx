'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Phone,
  MessageSquare,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  Bell,
  Shield,
  UserCheck,
  Timer,
  AlertCircle,
  Eye,
  FileText,
  Send
} from 'lucide-react';
import { DateTime } from 'luxon';

// Types matching our API
interface ActiveCrisis {
  id: string;
  user_id: string;
  user_name?: string;
  risk_level: 'moderate' | 'high' | 'crisis';
  status: 'detected' | 'assigned' | 'acknowledged' | 'in_progress' | 'resolved';
  assigned_therapist?: {
    id: string;
    name: string;
    response_time_estimate: number;
  };
  trigger_time: string;
  last_contact?: string;
  escalation_level: 'standard' | 'urgent' | 'immediate';
  follow_up_tasks: {
    pending: number;
    completed: number;
    overdue: number;
  };
}

interface CrisisDashboardData {
  active_crises: ActiveCrisis[];
  alert_statistics: {
    last_24h: {
      total_alerts: number;
      crisis_level: number;
      high_risk: number;
      moderate_risk: number;
      avg_response_time_minutes: number;
      successful_interventions: number;
    };
    trends: {
      direction: 'increasing' | 'stable' | 'decreasing';
      percentage_change: number;
    };
  };
  therapist_workload: Array<{
    therapist_id: string;
    name: string;
    status: 'available' | 'busy' | 'off_duty' | 'emergency_only';
    current_cases: number;
    max_cases: number;
    avg_response_time: number;
    alerts_today: number;
    utilization_percentage: number;
  }>;
  recent_interventions: Array<{
    id: string;
    user_id: string;
    user_name?: string;
    therapist_name: string;
    intervention_type: 'crisis_alert' | 'high_risk_alert' | 'follow_up';
    outcome: 'successful' | 'escalated' | 'in_progress' | 'failed';
    duration_minutes?: number;
    notes?: string;
    timestamp: string;
  }>;
  system_health: {
    alert_system: {
      status: 'operational' | 'degraded' | 'down';
      email_delivery_rate: number;
      sms_delivery_rate: number;
    };
    overall_health: 'healthy' | 'warning' | 'critical';
  };
}

export default function TherapistDashboard() {
  const [dashboardData, setDashboardData] = useState<CrisisDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrisis, setSelectedCrisis] = useState<ActiveCrisis | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; type: string; crisis?: ActiveCrisis }>({ open: false, type: '' });
  const [actionNotes, setActionNotes] = useState('');
  const [therapistStatus, setTherapistStatus] = useState('available');
  const [lastUpdate, setLastUpdate] = useState<DateTime>(DateTime.now());

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/crisis-dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setLastUpdate(DateTime.now());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Handle crisis actions
  const handleCrisisAction = async (action: string, crisisId: string, notes?: string) => {
    try {
      const response = await fetch('/api/crisis-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          crisis_id: crisisId,
          therapist_id: 'current_therapist', // This would come from auth
          notes
        })
      });

      if (response.ok) {
        await fetchDashboardData(); // Refresh data
        setActionDialog({ open: false, type: '' });
        setActionNotes('');
      }
    } catch (error) {
      console.error(`Failed to ${action} crisis:`, error);
    }
  };

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'crisis': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-400 bg-orange-50';
      case 'moderate': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-300';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected': return 'destructive';
      case 'assigned': return 'secondary';
      case 'acknowledged': return 'default';
      case 'in_progress': return 'default';
      case 'resolved': return 'default';
      default: return 'secondary';
    }
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const dt = DateTime.fromISO(timestamp);
    return dt.toRelative();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Alert className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load dashboard data. Please refresh the page.</AlertDescription>
      </Alert>
    );
  }

  const activeCrises = dashboardData.active_crises || [];
  const stats = dashboardData.alert_statistics;
  const workload = dashboardData.therapist_workload || [];
  const recentInterventions = dashboardData.recent_interventions || [];
  const systemHealth = dashboardData.system_health;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crisis Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Last updated: {lastUpdate.toFormat('MMM dd, HH:mm')} •
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              systemHealth.overall_health === 'healthy' ? 'bg-green-100 text-green-800' :
              systemHealth.overall_health === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              System {systemHealth.overall_health}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={therapistStatus} onValueChange={setTherapistStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="emergency_only">Emergency Only</SelectItem>
              <SelectItem value="off_duty">Off Duty</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchDashboardData}>
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Crises</p>
                <p className="text-2xl font-bold text-red-600">{activeCrises.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">24h Alerts</p>
                <p className="text-2xl font-bold">{stats.last_24h.total_alerts}</p>
              </div>
              <div className="flex items-center">
                {stats.trends.direction === 'increasing' ? (
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                ) : stats.trends.direction === 'decreasing' ? (
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <div className="h-4 w-4 mr-1" />
                )}
                <Bell className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">{stats.last_24h.avg_response_time_minutes}m</p>
              </div>
              <Timer className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((stats.last_24h.successful_interventions / stats.last_24h.total_alerts) * 100)}%
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Crises ({activeCrises.length})</TabsTrigger>
          <TabsTrigger value="workload">Team Workload</TabsTrigger>
          <TabsTrigger value="recent">Recent Interventions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Active Crises Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeCrises.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600">No active crises</p>
                <p className="text-sm text-gray-500">All users are safe</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeCrises.map((crisis) => (
                <Card key={crisis.id} className={`${getRiskColor(crisis.risk_level)} transition-all hover:shadow-md`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {crisis.risk_level === 'crisis' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {crisis.risk_level === 'high' && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                        {crisis.risk_level === 'moderate' && <Clock className="h-5 w-5 text-yellow-500" />}

                        Crisis {crisis.id.slice(-6)}

                        {crisis.escalation_level === 'immediate' && (
                          <Badge variant="destructive" className="ml-2">IMMEDIATE</Badge>
                        )}
                      </CardTitle>

                      <Badge variant={getStatusColor(crisis.status)} className="capitalize">
                        {crisis.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">User</p>
                        <p className="text-gray-600">{crisis.user_name || `User ${crisis.user_id.slice(-6)}`}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Risk Level</p>
                        <p className={`font-medium capitalize ${
                          crisis.risk_level === 'crisis' ? 'text-red-600' :
                          crisis.risk_level === 'high' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`}>
                          {crisis.risk_level}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Triggered</p>
                        <p className="text-gray-600">{formatTimeAgo(crisis.trigger_time)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Last Contact</p>
                        <p className="text-gray-600">
                          {crisis.last_contact ? formatTimeAgo(crisis.last_contact) : 'No contact'}
                        </p>
                      </div>
                    </div>

                    {/* Follow-up Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">Follow-up Tasks</span>
                        <span className="text-gray-600">
                          {crisis.follow_up_tasks.completed} / {crisis.follow_up_tasks.completed + crisis.follow_up_tasks.pending} completed
                        </span>
                      </div>
                      <Progress
                        value={(crisis.follow_up_tasks.completed / (crisis.follow_up_tasks.completed + crisis.follow_up_tasks.pending)) * 100}
                        className="h-2"
                      />
                      {crisis.follow_up_tasks.overdue > 0 && (
                        <p className="text-xs text-red-600">
                          ⚠️ {crisis.follow_up_tasks.overdue} overdue tasks
                        </p>
                      )}
                    </div>

                    {/* Assigned Therapist */}
                    {crisis.assigned_therapist && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">
                            Assigned to {crisis.assigned_therapist.name}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">
                          Expected response: {crisis.assigned_therapist.response_time_estimate} minutes
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCrisis(crisis)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>

                      {crisis.status === 'assigned' && (
                        <Button
                          size="sm"
                          onClick={() => setActionDialog({ open: true, type: 'acknowledge', crisis })}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}

                      {crisis.status === 'acknowledged' && (
                        <Button
                          size="sm"
                          onClick={() => setActionDialog({ open: true, type: 'start_intervention', crisis })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Start Intervention
                        </Button>
                      )}

                      {(crisis.status === 'in_progress' || crisis.status === 'acknowledged') && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActionDialog({ open: true, type: 'escalate', crisis })}
                          className="border-orange-500 text-orange-600 hover:bg-orange-50"
                        >
                          <ArrowUp className="h-4 w-4 mr-1" />
                          Escalate
                        </Button>
                      )}

                      {crisis.status !== 'resolved' && (
                        <Button
                          size="sm"
                          onClick={() => setActionDialog({ open: true, type: 'resolve', crisis })}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Team Workload Tab */}
        <TabsContent value="workload" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workload.map((therapist) => (
              <Card key={therapist.therapist_id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span>{therapist.name}</span>
                    <Badge
                      variant={therapist.status === 'available' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {therapist.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Case Load</span>
                      <span>{therapist.current_cases} / {therapist.max_cases}</span>
                    </div>
                    <Progress value={therapist.utilization_percentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Avg Response</p>
                      <p className="text-gray-600">{therapist.avg_response_time}m</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Alerts Today</p>
                      <p className="text-gray-600">{therapist.alerts_today}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recent Interventions Tab */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Interventions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInterventions.map((intervention) => (
                  <div key={intervention.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {intervention.user_name || `User ${intervention.user_id.slice(-6)}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {intervention.intervention_type.replace('_', ' ')} by {intervention.therapist_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={intervention.outcome === 'successful' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {intervention.outcome}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(intervention.timestamp)}
                        </p>
                      </div>
                    </div>
                    {intervention.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{intervention.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Alert Breakdown (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Crisis Level</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: `${(stats.last_24h.crisis_level / stats.last_24h.total_alerts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.last_24h.crisis_level}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">High Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(stats.last_24h.high_risk / stats.last_24h.total_alerts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.last_24h.high_risk}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Moderate Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${(stats.last_24h.moderate_risk / stats.last_24h.total_alerts) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{stats.last_24h.moderate_risk}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Email Delivery</span>
                    <span className="text-sm font-medium">{systemHealth.alert_system.email_delivery_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">SMS Delivery</span>
                    <span className="text-sm font-medium">{systemHealth.alert_system.sms_delivery_rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Overall Status</span>
                    <Badge
                      variant={systemHealth.overall_health === 'healthy' ? 'default' : 'destructive'}
                      className="capitalize"
                    >
                      {systemHealth.overall_health}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'acknowledge' && 'Acknowledge Crisis'}
              {actionDialog.type === 'start_intervention' && 'Start Intervention'}
              {actionDialog.type === 'escalate' && 'Escalate Crisis'}
              {actionDialog.type === 'resolve' && 'Resolve Crisis'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {actionDialog.crisis && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">
                  <strong>Crisis:</strong> {actionDialog.crisis.id.slice(-6)} -
                  <span className="capitalize ml-1">{actionDialog.crisis.risk_level} risk</span>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>User:</strong> {actionDialog.crisis.user_name || actionDialog.crisis.user_id.slice(-6)}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={`Add notes about this ${actionDialog.type}...`}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: '' })}>
              Cancel
            </Button>
            <Button
              onClick={() => actionDialog.crisis && handleCrisisAction(
                actionDialog.type,
                actionDialog.crisis.id,
                actionNotes
              )}
              className={
                actionDialog.type === 'resolve' ? 'bg-green-600 hover:bg-green-700' :
                actionDialog.type === 'escalate' ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-blue-600 hover:bg-blue-700'
              }
            >
              <Send className="h-4 w-4 mr-2" />
              Confirm {actionDialog.type.replace('_', ' ')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Crisis Detail Dialog */}
      <Dialog open={!!selectedCrisis} onOpenChange={() => setSelectedCrisis(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crisis Details - {selectedCrisis?.id.slice(-6)}</DialogTitle>
          </DialogHeader>

          {selectedCrisis && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Risk Level</label>
                  <p className={`text-lg font-bold capitalize ${
                    selectedCrisis.risk_level === 'crisis' ? 'text-red-600' :
                    selectedCrisis.risk_level === 'high' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    {selectedCrisis.risk_level}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="text-lg capitalize">{selectedCrisis.status.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Triggered</label>
                  <p>{DateTime.fromISO(selectedCrisis.trigger_time).toFormat('MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Contact</label>
                  <p>
                    {selectedCrisis.last_contact
                      ? DateTime.fromISO(selectedCrisis.last_contact).toFormat('MMM dd, yyyy HH:mm')
                      : 'No contact yet'
                    }
                  </p>
                </div>
              </div>

              {/* Follow-up Timeline */}
              <div>
                <h3 className="text-lg font-medium mb-3">72-Hour Follow-up Protocol</h3>
                <div className="space-y-3">
                  {[
                    { time: '1 hour', task: 'Therapist reminder', status: 'completed' },
                    { time: '6 hours', task: 'User check-in', status: 'completed' },
                    { time: '24 hours', task: 'Safety assessment', status: 'in_progress' },
                    { time: '48 hours', task: 'Stability check', status: 'pending' },
                    { time: '72 hours', task: 'Care planning', status: 'pending' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'in_progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`} />
                      <span className="text-sm font-medium">{item.time}</span>
                      <span className="text-sm text-gray-600">{item.task}</span>
                      <Badge
                        variant={item.status === 'completed' ? 'default' : 'secondary'}
                        className="ml-auto text-xs"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}