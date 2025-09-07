import { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

interface Document {
  id: string;
  filename: string;
  type: string;
  mime_type: string;
  size_bytes: number;
  storage_path: string;
  preview_path: string | null;
  resonance: any;
  session_id: string | null;
  created_at: string;
  updated_at: string;
  status: string;
}

interface UseUserDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  uploadDocument: (document: Document) => void;
}

export function useUserDocuments(): UseUserDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = useSupabaseClient();
  const user = useUser();

  const fetchDocuments = async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setDocuments(data || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = (document: Document) => {
    setDocuments(prev => [document, ...prev]);
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('documents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Document change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setDocuments(prev => [payload.new as Document, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDocuments(prev => 
              prev.map(doc => 
                doc.id === payload.new.id ? payload.new as Document : doc
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setDocuments(prev => 
              prev.filter(doc => doc.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    uploadDocument
  };
}