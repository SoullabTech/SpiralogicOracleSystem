import dynamic from "next/dynamic";
const CostSimulator = dynamic(() => import("@/components/cost/CostSimulator"), { ssr: false });

export default function Page() {
  return (
    <main className="p-6">
      <CostSimulator />
    </main>
  );
}