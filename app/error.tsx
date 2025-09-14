'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-tesla-900/80 backdrop-blur-xl border-tesla-red/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-tesla-red/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-tesla-red" />
          </div>
          <CardTitle className="text-xl font-semibold">Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We encountered an unexpected error. This has been logged and our team will investigate.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left">
              <summary className="cursor-pointer text-xs text-tesla-red hover:text-tesla-red/80">
                Error Details (Development)
              </summary>
              <pre className="mt-2 p-2 bg-tesla-red/10 rounded text-xs text-tesla-red/80 overflow-auto">
                {error.message}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              onClick={reset}
              className="bg-gold-divine text-black hover:bg-gold-amber transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="border-gold-divine/20 hover:bg-gold-divine/10 text-white"
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}