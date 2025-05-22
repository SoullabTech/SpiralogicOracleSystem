export default function SaveBreathButton({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex justify-center mt-6">
      <button
        onClick={onSave}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
      >
        Save Today's Breath
      </button>
    </div>
  );
}
