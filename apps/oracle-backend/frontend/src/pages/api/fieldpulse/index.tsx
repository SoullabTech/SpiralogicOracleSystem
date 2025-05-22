// /pages/fieldpulse/index.tsx
import dynamic from "next/dynamic";
import Head from "next/head";

const FieldPulseDashboard = dynamic(() => import("@/components/FieldPulseDashboard"), { ssr: false });

export default function FieldPulsePage() {
  return (
    <>
      <Head>
        <title>Spiralogic FieldPulse</title>
      </Head>
      <main className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-6">
        <FieldPulseDashboard />
      </main>
    </>
  );
}
