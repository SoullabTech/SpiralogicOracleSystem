'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SendInvitesPage() {
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [template, setTemplate] = useState('beta-invitation');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [csvText, setCsvText] = useState('');
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSendSingle = async () => {
    setSending(true);
    setResults(null);

    try {
      const response = await fetch('/api/email/send-beta-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'single', template, name, email })
      });

      const result = await response.json();
      setResults(result);

      if (result.success) {
        setName('');
        setEmail('');
      }
    } catch (error: any) {
      setResults({ success: false, error: error.message });
    } finally {
      setSending(false);
    }
  };

  const handleSendBatch = async () => {
    setSending(true);
    setResults(null);

    try {
      const lines = csvText.trim().split('\n');
      const invites = lines
        .filter(line => line.trim())
        .map(line => {
          const [name, email] = line.split(',').map(s => s.trim());
          return { name, email };
        })
        .filter(invite => invite.name && invite.email);

      if (invites.length === 0) {
        setResults({ success: false, error: 'No valid invites found' });
        setSending(false);
        return;
      }

      const response = await fetch('/api/email/send-beta-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'batch', template, invites })
      });

      const result = await response.json();
      setResults(result);

      if (result.successful > 0) {
        setCsvText('');
      }
    } catch (error: any) {
      setResults({ success: false, error: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-light text-amber-50 mb-2">Send Beta Invitations</h1>
          <p className="text-amber-200/50 text-sm">Send beautiful email invitations to MAIA beta explorers</p>
        </div>

        <Card className="bg-[#1a1f3a] border-amber-500/20 p-6 mb-8">
          <label className="block text-sm text-amber-200/70 mb-3">Email Template</label>
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 focus:outline-none focus:border-amber-500/40"
          >
            <option value="beta-invitation">🎉 Beta Invitation (Initial)</option>
            <option value="beta-welcome">👋 Welcome Email (Monday Launch)</option>
            <option value="beta-week1-checkin">📅 Week 1 Check-in</option>
            <option value="beta-week2-survey">📊 Week 2 Survey</option>
            <option value="beta-week3-group-call">📞 Week 3 Group Call</option>
            <option value="beta-week4-closing">🎊 Week 4 Closing</option>
          </select>
          <p className="text-xs text-amber-200/40 mt-2">
            {template === 'beta-invitation' && 'Initial invitation to join MAIA beta'}
            {template === 'beta-welcome' && 'Welcome message with access instructions'}
            {template === 'beta-week1-checkin' && 'First week experience check-in'}
            {template === 'beta-week2-survey' && 'Mid-beta feedback survey'}
            {template === 'beta-week3-group-call' && 'Group call invitation'}
            {template === 'beta-week4-closing' && 'Beta closing and next steps'}
          </p>
        </Card>

        <div className="flex gap-4 mb-8">
          <Button
            variant={mode === 'single' ? 'default' : 'outline'}
            onClick={() => setMode('single')}
            className="flex-1"
          >
            Single Invite
          </Button>
          <Button
            variant={mode === 'batch' ? 'default' : 'outline'}
            onClick={() => setMode('batch')}
            className="flex-1"
          >
            Batch Send (CSV)
          </Button>
        </div>

        {mode === 'single' ? (
          <Card className="bg-[#1a1f3a] border-amber-500/20 p-6">
            <h2 className="text-xl font-light text-amber-50 mb-6">Send Single Invitation</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-amber-200/70 mb-2">Recipient Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kelly"
                  className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div>
                <label className="block text-sm text-amber-200/70 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kelly@example.com"
                  className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/30 focus:outline-none focus:border-amber-500/40"
                />
              </div>
            </div>

            <Button
              onClick={handleSendSingle}
              disabled={sending || !name || !email}
              className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-50"
            >
              {sending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </Card>
        ) : (
          <Card className="bg-[#1a1f3a] border-amber-500/20 p-6">
            <h2 className="text-xl font-light text-amber-50 mb-6">Batch Send Invitations</h2>

            <div className="mb-6">
              <label className="block text-sm text-amber-200/70 mb-2">
                CSV Format (one per line)
              </label>
              <p className="text-xs text-amber-200/40 mb-3">
                Format: Name, email@example.com
              </p>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Kelly, kelly@example.com&#10;Sarah, sarah@example.com&#10;Michael, michael@example.com"
                rows={10}
                className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-lg text-amber-50 placeholder-amber-200/20 focus:outline-none focus:border-amber-500/40 font-mono text-sm"
              />
              <p className="text-xs text-amber-200/30 mt-2">
                {csvText.trim().split('\n').filter(l => l.trim()).length} invites ready
              </p>
            </div>

            <Button
              onClick={handleSendBatch}
              disabled={sending || !csvText.trim()}
              className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-50"
            >
              {sending ? 'Sending...' : 'Send All Invitations'}
            </Button>
          </Card>
        )}

        {results && (
          <Card className={`mt-6 p-6 ${results.success || results.successful > 0 ? 'bg-green-900/20 border-green-500/20' : 'bg-red-900/20 border-red-500/20'}`}>
            <h3 className="text-lg font-medium text-amber-50 mb-3">
              {results.success || results.successful > 0 ? '✅ Success' : '❌ Error'}
            </h3>

            {results.total !== undefined ? (
              <div className="space-y-2 text-sm">
                <p className="text-amber-200/70">
                  <strong>Total:</strong> {results.total} invites
                </p>
                <p className="text-amber-200/70">
                  <strong>Sent:</strong> {results.successful}
                </p>
                <p className="text-amber-200/70">
                  <strong>Failed:</strong> {results.failed}
                </p>
                {results.results && results.results.length > 0 && (
                  <div className="mt-4 max-h-60 overflow-y-auto">
                    <p className="text-amber-200/50 mb-2">Details:</p>
                    {results.results.map((r: any, i: number) => (
                      <div key={i} className={`text-xs p-2 rounded mb-1 ${r.success ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                        <span className={r.success ? 'text-green-300' : 'text-red-300'}>
                          {r.success ? '✓' : '✗'}
                        </span>
                        {' '}
                        {r.name} ({r.email})
                        {r.error && <span className="text-red-300"> - {r.error}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm">
                {results.success ? (
                  <p className="text-green-300">Invitation sent successfully!</p>
                ) : (
                  <p className="text-red-300">Error: {results.error}</p>
                )}
              </div>
            )}
          </Card>
        )}

        <Card className="mt-8 bg-amber-500/5 border-amber-500/20 p-6">
          <h3 className="text-lg font-medium text-amber-50 mb-3">📋 Setup Instructions</h3>
          <div className="space-y-3 text-sm text-amber-200/70">
            <div>
              <p className="font-medium text-amber-50 mb-1">1. Get Resend API Key</p>
              <p>Sign up at <a href="https://resend.com" target="_blank" className="text-amber-400 underline">resend.com</a> (free tier: 100 emails/day)</p>
            </div>

            <div>
              <p className="font-medium text-amber-50 mb-1">2. Add to .env.local</p>
              <code className="block bg-black/40 p-2 rounded mt-1 font-mono text-xs">
                RESEND_API_KEY=re_your_key_here
              </code>
            </div>

            <div>
              <p className="font-medium text-amber-50 mb-1">3. Verify Domain (Optional)</p>
              <p>In Resend dashboard, verify kelly@soullab.life domain for better deliverability</p>
            </div>

            <div>
              <p className="font-medium text-amber-50 mb-1">4. Test First</p>
              <p>Send a test to your own email before batch sending</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}