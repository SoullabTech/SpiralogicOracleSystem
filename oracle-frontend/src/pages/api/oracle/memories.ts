import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const { userId } = req.query;
  const { data, error } = await supabase
    .from('oracle_memories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json(data);
}
