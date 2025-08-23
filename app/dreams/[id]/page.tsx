import DreamEditor from "@/components/dreams/DreamEditor";

export default function EditDreamPage({ params }: { params: { id: string }}) {
  return (
    <main className="p-4">
      <DreamEditor dreamId={params.id} />
    </main>
  );
}