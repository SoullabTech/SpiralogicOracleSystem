'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Upload,
  Folder,
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sync,
  Settings,
  Database,
  TrendingUp,
  Clock,
  Archive,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useObsidianSync } from '@/lib/hooks/useObsidianSync';
import { DateTime } from 'luxon';

interface ExportHistoryItem {
  export_id: string;
  exported_at: string;
  type: 'single_session' | 'batch_sync' | 'vault_init';
  session_count: number;
  status: 'success' | 'failed';
}

export default function ObsidianSyncDashboard() {
  const {
    syncState,
    autoSyncEnabled,
    setAutoSyncEnabled,
    checkVaultStatus,
    initializeVault,
    syncRecentSessions,
    batchExportSessions,
    getExportHistory,
    isReady,
    isSyncing,
    hasError,
    lastSyncText
  } = useObsidianSync();

  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<any[]>([]);
  const [manualExportDialog, setManualExportDialog] = useState(false);
  const [customSyncDialog, setCustomSyncDialog] = useState(false);
  const [syncSinceDate, setSyncSinceDate] = useState(
    DateTime.now().minus({ days: 7 }).toFormat('yyyy-MM-dd')
  );

  // Load export history on mount
  useEffect(() => {
    loadExportHistory();
  }, []);

  const loadExportHistory = async () => {
    try {
      const history = await getExportHistory();
      if (history) {
        setExportHistory(history.export_history || []);
      }
    } catch (error) {
      console.error('Failed to load export history:', error);
    }
  };

  const handleInitializeVault = async () => {
    try {
      await initializeVault();
      await checkVaultStatus();
    } catch (error) {
      console.error('Failed to initialize vault:', error);
    }
  };

  const handleSyncRecent = async () => {
    try {
      await syncRecentSessions();
      await loadExportHistory();
    } catch (error) {
      console.error('Failed to sync recent sessions:', error);
    }
  };

  const handleCustomSync = async () => {
    try {
      const sinceDate = DateTime.fromFormat(syncSinceDate, 'yyyy-MM-dd').toISO();
      await syncRecentSessions(sinceDate);
      await loadExportHistory();
      setCustomSyncDialog(false);
    } catch (error) {
      console.error('Failed to perform custom sync:', error);
    }
  };

  const handleBatchExport = async () => {
    if (selectedSessions.length === 0) return;

    try {
      await batchExportSessions(selectedSessions);
      await loadExportHistory();
      setManualExportDialog(false);
      setSelectedSessions([]);
    } catch (error) {
      console.error('Failed to batch export sessions:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'syncing': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Obsidian Vault Sync</h1>
          <p className="text-gray-600 mt-1">
            Export MAIA sessions to your Obsidian vault for research and analysis
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Auto-sync</label>
            <Switch
              checked={autoSyncEnabled}
              onCheckedChange={setAutoSyncEnabled}
              disabled={!isReady}
            />
          </div>

          <Button
            variant="outline"
            onClick={checkVaultStatus}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vault Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusColor(syncState.status)} className="capitalize">
                    {getStatusIcon(syncState.status)}
                    {syncState.isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </div>
              <Folder className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exported Sessions</p>
                <p className="text-2xl font-bold">{syncState.totalSessions}</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Sync</p>
                <p className="text-lg font-medium">{lastSyncText}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Auto-sync</p>
                <p className="text-lg font-medium">{autoSyncEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
              <Sync className={`h-8 w-8 ${autoSyncEnabled ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Alert */}
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {syncState.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Vault Path Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Vault Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Vault Path</label>
              <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                {syncState.vaultPath || 'Not configured'}
              </p>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Structure:</strong></p>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li><code>Sessions/</code> - Individual session notes (.md files)</li>
                <li><code>Canvas/</code> - Visual session maps (.canvas files)</li>
                <li><code>Index/</code> - Auto-generated index and tracking files</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Action Tabs */}
      <Tabs defaultValue="sync" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sync">Sync Operations</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
          <TabsTrigger value="manual">Manual Export</TabsTrigger>
        </TabsList>

        {/* Sync Operations Tab */}
        <TabsContent value="sync" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Initialize Vault</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Set up the Obsidian vault structure with folders and index files.
                </p>
                <Button
                  onClick={handleInitializeVault}
                  disabled={isSyncing || syncState.isConnected}
                  className="w-full"
                >
                  <Database className="h-4 w-4 mr-2" />
                  {syncState.isConnected ? 'Already Initialized' : 'Initialize Vault'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Export all sessions from the last 24 hours to your vault.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSyncRecent}
                    disabled={isSyncing || !isReady}
                    className="flex-1"
                  >
                    <Sync className="h-4 w-4 mr-2" />
                    Sync Recent (24h)
                  </Button>
                  <Dialog open={customSyncDialog} onOpenChange={setCustomSyncDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" disabled={!isReady}>
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Custom Date Range Sync</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Sync sessions since:</label>
                          <input
                            type="date"
                            value={syncSinceDate}
                            onChange={(e) => setSyncSinceDate(e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setCustomSyncDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCustomSync} disabled={isSyncing}>
                          <Sync className="h-4 w-4 mr-2" />
                          Sync Range
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sync Progress */}
          {isSyncing && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">Syncing to Obsidian vault...</p>
                    <p className="text-sm text-gray-600">Please wait while sessions are exported</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Export History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Export History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exportHistory.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No export history available</p>
              ) : (
                <div className="space-y-3">
                  {exportHistory.map((item) => (
                    <div key={item.export_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="font-medium capitalize">
                            {item.type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.session_count} sessions exported
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.status === 'success' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {DateTime.fromISO(item.exported_at).toFormat('MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Export Tab */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Session Export</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Select specific sessions to export to your Obsidian vault.
              </p>

              <Dialog open={manualExportDialog} onOpenChange={setManualExportDialog}>
                <DialogTrigger asChild>
                  <Button disabled={!isReady}>
                    <Upload className="h-4 w-4 mr-2" />
                    Select Sessions to Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Select Sessions</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Choose sessions to export to your Obsidian vault:
                    </p>
                    <Textarea
                      placeholder="Paste session IDs (one per line) or JSON data..."
                      rows={8}
                      value={selectedSessions.map(s => s.id || JSON.stringify(s)).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').filter(line => line.trim());
                        const sessions = lines.map(line => {
                          try {
                            return JSON.parse(line);
                          } catch {
                            return { id: line.trim() };
                          }
                        });
                        setSelectedSessions(sessions);
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      Selected: {selectedSessions.length} sessions
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setManualExportDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBatchExport}
                      disabled={selectedSessions.length === 0 || isSyncing}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Export {selectedSessions.length} Sessions
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}