// 📁 BACKEND/src/lib/geometryEngine.ts
import { PetalTransitions } from './harmonicPetalMap';

export function generateMandalaPattern(element: string, phase: number): string {
  const transition = PetalTransitions.find(p => p.from === element);
  const size = transition ? 100 * transition.multiplier : 100;
  return `M 0 0 L ${size} 0 A ${size} ${size} 0 1 1 0 ${size} Z`;
}