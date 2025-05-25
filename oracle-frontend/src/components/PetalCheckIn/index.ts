import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import SaveBreathButton from "@/components/shared/SaveBreathButton";

interface PetalCheckInFlowProps {
  selectedElements: { [id: string]: string };
  lightness: string;
}

export default function PetalCheckInFlow({ selectedElements, lightness }: PetalCheckInFlowProps) {
  const navigate = useNavigate();

  const handleSave = async () => {
    const ritualData = {
      date: new Date().toISOString(),
      elements: selectedElements,
      lightness,
      dream: null,
      dream_petal: null,
      wild_petals: [],
    };

    const { error } = await supabase.from("spiral_breaths").insert([ritualData]);

    if (error) {
      console.error("Error saving Spiral Breath:", error.message);
      alert("⚡ Failed to save Spiral Breath. Try again.");
    } else {
      alert("🌸 Your Spiral Breath was saved to Sacred Memory!");
      navigate("/spiral-calendar");
    }
  };

  return (
    <div>
      {/* Additional check-in UI goes here if needed */}
      <SaveBreathButton onSave={handleSave} />
    </div>
  );
}
