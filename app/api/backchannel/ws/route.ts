// app/api/backchannel/ws/route.ts
// WebSocket backchannel for collective listening - privacy-preserving pattern recognition

import { Server } from 'socket.io';
import { NextApiRequest } from 'next';
import { SymbolicSignal, CollectiveSnapshot } from '@/lib/voice/types';

// In-memory storage for beta (replace with Redis/DB in production)
const activeConnections = new Map<string, any>();
const symbolBuffer = new Map<string, SymbolicSignal[]>();
const BUFFER_WINDOW_MS = 30000; // 30 second sliding window

export const dynamic = 'force-dynamic';

// WebSocket handler
export async function GET(req: Request) {
  // Upgrade to WebSocket
  const upgradeHeader = req.headers.get('upgrade');

  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  // Create WebSocket response
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  // Handle the WebSocket connection
  handleWebSocket(server);

  return new Response(null, {
    status: 101,
    webSocket: client,
  } as any); // Next.js 14+ WebSocket support
}

function handleWebSocket(ws: WebSocket) {
  const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  ws.addEventListener('open', () => {
    console.log(`Backchannel connection opened: ${connectionId}`);
    activeConnections.set(connectionId, ws);

    // Send initial state
    ws.send(JSON.stringify({
      type: 'connected',
      connectionId,
      activeUsers: activeConnections.size
    }));
  });

  ws.addEventListener('message', async (event) => {
    try {
      const message = JSON.parse(event.data as string);

      switch (message.type) {
        case 'symbolic-contribution':
          await handleSymbolicContribution(message.data as SymbolicSignal, connectionId);
          break;

        case 'request-snapshot':
          const snapshot = generateCollectiveSnapshot(message.teamId);
          ws.send(JSON.stringify({
            type: 'collective-snapshot',
            data: snapshot
          }));
          break;

        case 'heartbeat':
          ws.send(JSON.stringify({ type: 'heartbeat-ack' }));
          break;
      }
    } catch (error) {
      console.error('Backchannel message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.addEventListener('close', () => {
    console.log(`Backchannel connection closed: ${connectionId}`);
    activeConnections.delete(connectionId);
  });

  ws.addEventListener('error', (error) => {
    console.error(`Backchannel error for ${connectionId}:`, error);
    activeConnections.delete(connectionId);
  });
}

async function handleSymbolicContribution(signal: SymbolicSignal, connectionId: string) {
  // Add to buffer
  const teamBuffer = symbolBuffer.get(signal.teamId) || [];
  teamBuffer.push(signal);

  // Clean old signals outside window
  const cutoff = Date.now() - BUFFER_WINDOW_MS;
  const filtered = teamBuffer.filter(s => s.ts > cutoff);
  symbolBuffer.set(signal.teamId, filtered);

  // Check for collective patterns
  if (filtered.length >= 3) { // Minimum 3 users for pattern
    const patterns = detectCollectivePatterns(filtered);

    if (patterns.emergence || patterns.coherence > 0.7) {
      // Broadcast insight to all team connections
      broadcastToTeam(signal.teamId, {
        type: 'collective-insight',
        data: {
          patterns,
          timestamp: Date.now()
        }
      });
    }
  }

  // Acknowledge contribution
  const ws = activeConnections.get(connectionId);
  if (ws) {
    ws.send(JSON.stringify({
      type: 'contribution-received',
      teamContributors: filtered.length
    }));
  }
}

function detectCollectivePatterns(signals: SymbolicSignal[]) {
  // Element dominance
  const elementCounts = new Map<string, number>();
  signals.forEach(signal => {
    signal.elements.forEach(elem => {
      const current = elementCounts.get(elem.name) || 0;
      elementCounts.set(elem.name, current + elem.intensity);
    });
  });

  // Motif frequency
  const motifCounts = new Map<string, number>();
  signals.forEach(signal => {
    signal.motifs.forEach(motif => {
      const current = motifCounts.get(motif) || 0;
      motifCounts.set(motif, current + 1);
    });
  });

  // Trust breath alignment
  const breathCounts = { in: 0, out: 0, hold: 0 };
  signals.forEach(signal => {
    breathCounts[signal.trustBreath]++;
  });

  // Calculate coherence (how aligned the collective is)
  const totalSignals = signals.length;
  const dominantElement = Array.from(elementCounts.entries())
    .sort(([,a], [,b]) => b - a)[0];
  const elementCoherence = dominantElement ? dominantElement[1] / totalSignals : 0;

  const dominantMotif = Array.from(motifCounts.entries())
    .sort(([,a], [,b]) => b - a)[0];
  const motifCoherence = dominantMotif ? dominantMotif[1] / totalSignals : 0;

  const breathCoherence = Math.max(...Object.values(breathCounts)) / totalSignals;

  const overallCoherence = (elementCoherence + motifCoherence + breathCoherence) / 3;

  // Detect emergence (new patterns)
  const hasSpirals = signals.filter(s => s.spiralFlag).length > totalSignals / 2;
  const emergence = hasSpirals && motifCoherence > 0.5;

  // Detect tension (opposing forces)
  const hasOpposing = (breathCounts.in > 0 && breathCounts.out > 0) ||
                      (elementCounts.get('fire') > 0 && elementCounts.get('water') > 0);

  return {
    coherence: overallCoherence,
    emergence,
    tension: hasOpposing ? 'opposing-forces' : undefined,
    dominantElement: dominantElement?.[0],
    dominantMotif: dominantMotif?.[0],
    collectiveBreath: Object.entries(breathCounts)
      .sort(([,a], [,b]) => b - a)[0][0]
  };
}

function generateCollectiveSnapshot(teamId: string): CollectiveSnapshot {
  const teamSignals = symbolBuffer.get(teamId) || [];
  const now = Date.now();

  // Aggregate elements
  const elementTotals = new Map<string, number[]>();
  teamSignals.forEach(signal => {
    signal.elements.forEach(elem => {
      const current = elementTotals.get(elem.name) || [];
      current.push(elem.intensity);
      elementTotals.set(elem.name, current);
    });
  });

  const elements = Array.from(elementTotals.entries()).map(([name, intensities]) => ({
    name: name as any,
    avg: intensities.reduce((a, b) => a + b, 0) / intensities.length
  }));

  // Aggregate motifs
  const motifCounts = new Map<string, number>();
  teamSignals.forEach(signal => {
    signal.motifs.forEach(motif => {
      motifCounts.set(motif, (motifCounts.get(motif) || 0) + 1);
    });
  });

  const topMotifs = Array.from(motifCounts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([key, count]) => ({ key, count }));

  // Trust breath distribution
  const trustBreath = { in: 0, out: 0, hold: 0 };
  teamSignals.forEach(signal => {
    trustBreath[signal.trustBreath]++;
  });

  // Calculate resonance field
  const patterns = detectCollectivePatterns(teamSignals);

  return {
    teamId,
    window: {
      from: now - BUFFER_WINDOW_MS,
      to: now
    },
    topMotifs,
    elements,
    trustBreath,
    resonanceField: {
      coherence: patterns.coherence,
      emergence: patterns.emergence,
      tension: patterns.tension
    }
  };
}

function broadcastToTeam(teamId: string, message: any) {
  // In production, filter connections by teamId
  // For beta, broadcast to all active connections
  activeConnections.forEach(ws => {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Broadcast error:', error);
    }
  });
}

// Cleanup interval
setInterval(() => {
  // Clean old signals from all team buffers
  const cutoff = Date.now() - BUFFER_WINDOW_MS * 2; // Keep 2x window for history

  symbolBuffer.forEach((signals, teamId) => {
    const filtered = signals.filter(s => s.ts > cutoff);
    if (filtered.length !== signals.length) {
      symbolBuffer.set(teamId, filtered);
    }
  });
}, 60000); // Every minute