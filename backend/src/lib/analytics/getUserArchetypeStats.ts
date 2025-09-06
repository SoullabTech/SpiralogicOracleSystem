import { supabase } from "../supabaseClient";

export interface ArchetypeStat {
  archetype: string;
  count: number;
  element: string;
}

export const getUserArchetypeStats = async (
  userId: string,
): Promise<ArchetypeStat[]> => {
  const { data, error } = await supabase
    .from(&quot;user_phases&quot;)
    .select("archetype, element")
    .eq("user_id", userId);

  if (error || !data) return [];

  const countMap = new Map<string, { count: number; element: string }>();

  data.forEach(({ archetype, element }) => {
    if (!archetype) return;
    if (countMap.has(archetype)) {
      countMap.get(archetype)!.count += 1;
    } else {
      countMap.set(archetype, { count: 1, element });
    }
  });

  return Array.from(countMap.entries()).map(
    ([archetype, { count, element }]) => ({
      archetype,
      count,
      element,
    }),
  );
};
