// src/pages/SpiralogicPathPage.tsx
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

const SpiralogicPathPage: React.FC = () => {
  const [path, setPath] = useState<any>(null);

  useEffect(() => {
    const fetchSpiralogicPath = async () => {
      const { data, error } = await supabase
        .from('spiralogic_path')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching path:', error);
      } else {
        setPath(data);
      }
    };

    fetchSpiralogicPath();
  }, []);

  if (!path) {
    return <div>Loading...</div>;
  }

  return (
    <div className="spiralogic-path">
      <h2>Your Spiralogic Path</h2>
      <p>{path.description}</p>
      <div>
        {path.phases.map((phase: string, index: number) => (
          <div key={index} className="phase">
            <h3>{phase}</h3>
            {/* Add more info here if needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpiralogicPathPage;
