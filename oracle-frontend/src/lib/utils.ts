import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | number | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export function randomId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

interface InsightData {
  id: string;
  created_at: string;
  keywords: string[];
  detected_phase: string;
  emotional_intensity: number;
  content?: string;
  user_id?: string;
}

export function downloadCSV(insights: InsightData[]) {
  if (!insights || insights.length === 0) {
    console.warn('No insights to export');
    return;
  }

  // Define CSV headers
  const headers = ['Date', 'Phase', 'Keywords', 'Emotional Intensity', 'Content'];
  
  // Convert insights to CSV rows
  const rows = insights.map(insight => {
    const date = formatDate(insight.created_at);
    const phase = insight.detected_phase || 'Unknown';
    const keywords = (insight.keywords || []).join('; ');
    const intensity = insight.emotional_intensity?.toFixed(2) || '0';
    const content = (insight.content || '').replace(/"/g, '""'); // Escape quotes
    
    return [
      date,
      phase,
      keywords,
      intensity,
      `"${content}"` // Quote content to handle commas and newlines
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `spiralogic-insights-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}