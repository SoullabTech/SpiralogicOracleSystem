'use client'

import { PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

type ElementalProfile = {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
};

export default function ElementalPolarChart({
  profile,
}: {
  profile: ElementalProfile;
}) {
  const data = {
    labels: ['Fire 🔥', 'Water 💧', 'Earth 🌍', 'Air 🌬️', 'Aether ✨'],
    datasets: [
      {
        label: 'Elemental Balance',
        data: [
          profile.fire,
          profile.water,
          profile.earth,
          profile.air,
          profile.aether,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#d4af37',
        },
        grid: {
          color: '#444',
        },
        pointLabels: {
          color: '#fff',
          font: {
            size: 14,
          },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <div className="bg-black/20 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gold">🧭 Elemental Map</h2>
      <PolarArea data={data} options={options as any} />
    </div>
  );
}
