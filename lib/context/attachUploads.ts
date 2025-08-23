export type Upload = { url: string; name?: string; type?: string };

export async function attachUploads<T extends { context?: any; uploads?: Upload[] }>(
  input: T
): Promise<T> {
  const uploads = input.uploads || [];
  if (!uploads.length) return input;
  const attachments = uploads.map(u => ({ url: u.url, name: u.name, type: u.type }));
  return { ...input, context: { ...(input.context || {}), attachments } };
}

export function getRecentUploadContext(uploads: Upload[] = [], limit = 5) {
  const recent = uploads.slice(-limit);
  return { attachments: recent.map(u => ({ url: u.url, name: u.name, type: u.type })) };
}

export function detectUploadReferences(text: string): Upload[] {
  if (!text) return [];
  const urls = Array.from(text.matchAll(/https?:\/\/\S+/g)).map(m => m[0]);
  return urls.map(url => ({ url }));
}

export default attachUploads;
