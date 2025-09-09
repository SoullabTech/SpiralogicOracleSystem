'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search, Crown } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen from-slate-900 via-amber-900/20 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-xl border-amber-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mb-4 opacity-60">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div className="text-6xl font-bold text-amber-400 mb-2">404</div>
          <CardTitle className="text-xl font-semibold">Path Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            This wisdom path doesn&apos;t exist in our oracle system. Let&apos;s guide you back to familiar territory.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={() => router.push('/')}
              className="from-amber-600 to-yellow-500 hover:from-amber-700 hover:to-yellow-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button 
              onClick={() => router.push('/oracle')}
              variant="outline"
              className="border-amber-500/20 hover:bg-amber-500/10"
            >
              <Search className="w-4 h-4 mr-2" />
              Oracle Chat
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-500/20">
            <p className="text-xs text-muted-foreground">
              Need help? Try our{' '}
              <button 
                onClick={() => router.push('/oracle')}
                className="text-amber-400 hover:text-amber-300 underline"
              >
                oracle chat
              </button>{' '}
              for guidance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}