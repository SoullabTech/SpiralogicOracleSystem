// src/components/FacilitatorDashboard.tsx
import { useState } from 'react';

const FacilitatorDashboard = () => {
  const [data, setData] = useState<string>('Welcome to the Facilitator Dashboard!');

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-semibold">Facilitator Dashboard</h2>
      <p>{data}</p>
      <button
        className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded"
        onClick={() => setData('Data updated!')}
      >
        Update Data
      </button>
    </div>
  );
};

export default FacilitatorDashboard;
