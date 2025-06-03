export default function ArchetypeSpiralMap() {
  return (
    <div className="flex justify-center items-center py-10">
      <svg width="320" height="320" viewBox="0 0 320 320">
        <circle cx="160" cy="160" r="140" stroke="#d4af37" strokeWidth="2" fill="none" />
        <text x="160" y="30" textAnchor="middle" fontSize="14" fill="#d4af37">Fire</text>
        <text x="280" y="160" textAnchor="middle" fontSize="14" fill="#d4af37">Earth</text>
        <text x="160" y="300" textAnchor="middle" fontSize="14" fill="#d4af37">Air</text>
        <text x="40" y="160" textAnchor="middle" fontSize="14" fill="#d4af37">Water</text>
        <text x="160" y="160" textAnchor="middle" fontSize="18" fill="#d4af37">Aether</text>
      </svg>
    </div>
  );
}
