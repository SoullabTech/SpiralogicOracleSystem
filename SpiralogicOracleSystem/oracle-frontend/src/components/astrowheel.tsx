// /src/components/AstroWheel.tsx


const RADIUS = 150;
const CENTER = RADIUS + 10;
const HOUSE_COUNT = 12;
const DEG_PER_HOUSE = 360 / HOUSE_COUNT;

function polarToCartesian(angle: number, radius: number) {
  const radians = (angle - 90) * (Math.PI / 180.0);
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

const AstroWheel = ({ planets }: { planets: { name: string; degree: number }[] }) => {
  return (
    <svg width={CENTER * 2} height={CENTER * 2}>
      {/* Circle */}
      <circle cx={CENTER} cy={CENTER} r={RADIUS} stroke="gray" fill="white" />

      {/* 12 Houses */}
      {[...Array(HOUSE_COUNT)].map((_, i) => {
        const angle = i * DEG_PER_HOUSE;
        const { x, y } = polarToCartesian(angle, RADIUS);
        return (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="black"
            strokeWidth={1}
          />
        );
      })}

      {/* Planet Glyphs */}
      {planets.map((planet, i) => {
        const angle = planet.degree;
        const { x, y } = polarToCartesian(angle, RADIUS - 20);
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize={16}
            fill="black"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {planet.name}
          </text>
        );
      })}
    </svg>
  );
};

export default AstroWheel;
