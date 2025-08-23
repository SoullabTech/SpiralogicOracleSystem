import DreamEditor from "@/components/dreams/DreamEditor";

export default function NewDreamPage() {
  return (
    <main className="p-4">
      <DreamEditor
        onSaved={(id) => console.log("saved", id)}
        onWoven={(id, buckets) => console.log("woven", id, buckets)}
      />
    </main>
  );
}