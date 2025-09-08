'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search, Crown } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-background/80 backdrop-blur-xl border-purple-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 from-purple-500 to-orange-500 rounded-full flex items-center justify-center mb-4 opacity-60">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <div className="text-6xl font-bold text-purple-400 mb-2">404</div>
          <CardTitle className="text-xl font-semibold">Path Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            This wisdom path doesn&apos;t exist in our oracle system. Let&apos;s guide you back to familiar territory.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={() => router.push('/')}
              className="from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button 
              onClick={() => router.push('/oracle')}
              variant="outline"
              className="border-purple-500/20 hover:bg-purple-500/10"
            >
              <Search className="w-4 h-4 mr-2" />
              Oracle Chat
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-500/20">
            <p className="text-xs text-muted-foreground">
              Need help? Try our{' '}
              <button 
                onClick={() => router.push('/oracle')}
                className="text-purple-400 hover:text-purple-300 underline"
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