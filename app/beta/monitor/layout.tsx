import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ARIA Beta Monitor - Soullab',
  description: 'Real-time monitoring of ARIA beta user activity and engagement',
};

export default function BetaMonitorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}