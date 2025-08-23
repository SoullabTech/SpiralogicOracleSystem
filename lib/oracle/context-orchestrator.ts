export interface ContextPack {
  nlu?: any;
  psi?: any;
  ainSnippets?: any[];
  soulSnippets?: any[];
  uploads?: any;
  facetHints?: any;
  micropsi?: {
    modulation?: any;
    driveVector?: any;
    affect?: any;
  };
}

export async function buildUnifiedContext(
  userId: string,
  text: string,
  conversationId: string
): Promise<ContextPack | null> {
  if (process.env.USE_MICROPSI_BACH !== 'true') {
    return null;
  }

  try {
    const { buildContextPack } = await import('@/lib/context/buildContext');
    return await buildContextPack({ userId, text, conversationId });
  } catch (error) {
    console.warn('Context pack building failed:', error);
    return null;
  }
}

export function stitchContextBlocks(pack: ContextPack): string {
  const blocks = [];
  
  if (pack.ainSnippets?.length > 0) {
    const snippets = pack.ainSnippets.slice(0, 6).map((s: any) => `• ${s.text}`).join('\n');
    blocks.push(`## Recent threads\n${snippets}`);
  }
  
  if (pack.soulSnippets?.length > 0) {
    const snippets = pack.soulSnippets.slice(0, 6).map((s: any) => `• ${s.text}`).join('\n');
    blocks.push(`## Sacred moments\n${snippets}`);
  }
  
  if (pack.uploads?.items?.length > 0) {
    const { formatUploadContextForPrompt } = require('@/lib/context/attachUploads');
    const uploadContext = formatUploadContextForPrompt(pack.uploads.items);
    if (uploadContext) {
      blocks.push(uploadContext);
    }
  }
  
  if (pack.facetHints && Object.keys(pack.facetHints).length > 0) {
    const hints = Object.entries(pack.facetHints)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, v]: any) => `${k}:${v.toFixed(2)}`)
      .join(', ');
    blocks.push(`## Facet hints\n${hints}`);
  }
  
  if (pack.micropsi?.driveVector) {
    const drives = Object.entries(pack.micropsi.driveVector)
      .map(([k, v]: any) => `${k}:${v.toFixed(2)}`)
      .join(', ');
    blocks.push(`## Active drives\n${drives}`);
  }
  
  return blocks.join('\n\n');
}