export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-bg-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Dev Navigation */}
        <div className="flex justify-between items-center bg-bg-800 border border-edge-700 rounded-lg p-4">
          <div className="flex gap-4">
            <a href="/dev/theme" className="text-ink-300 hover:text-ink-100 transition-colors">🎨 Theme Tokens</a>
            <a href="/dev/architecture" className="text-gold-400 font-medium">🏗️ Architecture</a>
          </div>
          <div className="flex gap-3 text-sm">
            <a href="https://github.com/spiralogic/oracle-system/blob/main/docs/architecture/README.md" target="_blank" className="text-ink-300 hover:text-gold-400 transition-colors">📚 Docs</a>
            <a href="/storybook" target="_blank" className="text-ink-300 hover:text-gold-400 transition-colors">📖 Storybook</a>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-ink-100 font-serif">
            Architecture Documentation
          </h1>
          <p className="text-ink-300 text-lg">
            Complete visual guide to the Spiralogic Oracle System
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* System Overview */}
          <DocCard
            title="🧠 System Mindmap"
            description="Interactive exploration of the entire system"
            links={[
              { 
                label: "Interactive Mindmap", 
                href: "/docs/mindmap/spiralogic.html",
                external: true 
              },
              { 
                label: "Mermaid Version", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/mindmap/spiralogic-mermaid.md",
                external: true 
              }
            ]}
          />

          {/* C4 Architecture */}
          <DocCard
            title="🏗️ C4 Diagrams"
            description="System architecture at different levels"
            links={[
              { 
                label: "Context (L1)", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/architecture/c4/01-context.md",
                external: true 
              },
              { 
                label: "Containers (L2)", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/architecture/c4/02-containers.md",
                external: true 
              },
              { 
                label: "Components (L3)", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/architecture/c4/03-components-backend.md",
                external: true 
              }
            ]}
          />

          {/* Sequence Diagrams */}
          <DocCard
            title="🔄 Sequence Flows"
            description="Key interaction patterns and data flows"
            links={[
              { 
                label: "Oracle Turn", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/architecture/sequence/oracle-turn.md",
                external: true 
              },
              { 
                label: "Upload Processing", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/architecture/sequence/upload-process.md",
                external: true 
              },
              { 
                label: "Soul Memory Bookmark", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/architecture/sequence/soul-memory-bookmark.md",
                external: true 
              }
            ]}
          />

          {/* UX Flows */}
          <DocCard
            title="🎨 UX Flows"
            description="User experience and interface navigation"
            links={[
              { 
                label: "Site Map", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/ux/site-map.md",
                external: true 
              },
              { 
                label: "Chat + Upload Journey", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/ux/journey-chat-upload.md",
                external: true 
              },
              { 
                label: "Admin Console", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/ux/admin-console.md",
                external: true 
              }
            ]}
          />

          {/* Main Documentation */}
          <DocCard
            title="📚 Architecture Atlas"
            description="Complete documentation hub"
            links={[
              { 
                label: "Main README", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/architecture/README.md",
                external: true 
              },
              { 
                label: "Contributing Guide", 
                href: "https://github.com/spiralogic/oracle-system/blob/main/docs/architecture/CONTRIBUTING.md",
                external: true 
              }
            ]}
          />

          {/* Design System */}
          <DocCard
            title="🎨 Design System"
            description="Token preview and component documentation"
            links={[
              { 
                label: "Theme Preview", 
                href: "/dev/theme" 
              },
              { 
                label: "Storybook", 
                href: "/storybook",
                external: true 
              }
            ]}
          />
        </div>

        {/* Development Tools */}
        <div className="border-t border-edge-700 pt-8">
          <h2 className="text-2xl font-semibold text-ink-100 mb-6">Development Tools</h2>
          
          <div className="bg-bg-800 border border-edge-700 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-medium text-ink-100">Mindmap Commands</h3>
            <div className="space-y-2 font-mono text-sm">
              <div className="bg-bg-900 p-3 rounded border border-edge-700">
                <div className="text-ink-300 mb-1"># Build interactive mindmap</div>
                <div className="text-gold-400">npm run mindmap:build</div>
              </div>
              <div className="bg-bg-900 p-3 rounded border border-edge-700">
                <div className="text-ink-300 mb-1"># Build and open in browser</div>
                <div className="text-gold-400">npm run mindmap:open</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div className="bg-bg-800 border border-edge-700 rounded-xl p-6">
          <h3 className="text-lg font-medium text-ink-100 mb-4">Quick Reference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-ink-100 mb-2">Key Components</h4>
              <ul className="space-y-1 text-ink-300">
                <li>• Next.js App Router frontend</li>
                <li>• Backend agents (Air, Earth, Water, Fire, Aether)</li>
                <li>• Soul Memory System integration</li>
                <li>• Supabase database with RLS</li>
                <li>• OpenAI API for AI responses</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-ink-100 mb-2">Key Flows</h4>
              <ul className="space-y-1 text-ink-300">
                <li>• User → Oracle → Memory storage</li>
                <li>• File upload → Processing → Embeddings</li>
                <li>• Admin → Monitoring → Management</li>
                <li>• Beta → Badges → Graduation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-ink-300 text-sm">
          <p>
            All diagrams render natively on GitHub. 
            For local development, use the mindmap commands above.
          </p>
        </div>
      </div>
    </div>
  )
}

// Helper component for documentation cards
function DocCard({ 
  title, 
  description, 
  links 
}: { 
  title: string
  description: string
  links: Array<{ label: string; href: string; external?: boolean }>
}) {
  return (
    <div className="bg-bg-800 border border-edge-700 rounded-xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-ink-100 mb-2">{title}</h3>
        <p className="text-ink-300 text-sm">{description}</p>
      </div>
      <div className="space-y-2">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="block text-gold-400 hover:text-gold-500 text-sm transition-colors"
          >
            {link.label}
            {link.external && " ↗"}
          </a>
        ))}
      </div>
    </div>
  )
}