// Debug page to check environment variables in Next.js
export default function DebugEnvPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Environment Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">API URLs</h2>
          <pre className="text-sm mt-2">
            NEXT_PUBLIC_API_BASE_URL: {process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT_SET'}
            {'\n'}NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT_SET'}
            {'\n'}NEXT_PUBLIC_BACKEND_URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'NOT_SET'}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Supabase</h2>
          <pre className="text-sm mt-2">
            NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET'}
            {'\n'}NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET'}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Environment</h2>
          <pre className="text-sm mt-2">
            NODE_ENV: {process.env.NODE_ENV}
            {'\n'}NEXT_PUBLIC_ENV_NAME: {process.env.NEXT_PUBLIC_ENV_NAME || 'NOT_SET'}
          </pre>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Only NEXT_PUBLIC_* variables are visible in the browser.
            Server-side variables like SUPABASE_SERVICE_ROLE_KEY are hidden for security.
          </p>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          // This runs in the browser and will show in console
          console.log('🔍 Client-side API Base URL:', '${process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT_SET'}');
          console.log('🔍 All NEXT_PUBLIC vars:', ${JSON.stringify(
            Object.entries(process.env)
              .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
              .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
          )});
        `
      }} />
    </div>
  );
}