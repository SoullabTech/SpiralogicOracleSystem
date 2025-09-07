'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SacredLibraryBlooming from './SacredLibraryBlooming';

type DocumentStatus = 'pending' | 'analyzed' | 'error';

type ElementalBalance = {
  fire: number;
  water: number;
  earth: number;
  air: number;
  aether: number;
};

type DocumentAnalysis = {
  dominantElement: keyof ElementalBalance;
  elementalBalance: ElementalBalance;
  keyThemes: string[];
  shadowAspects: string[];
  coherenceIndicators: string[];
  aetherResonance: number;
};

type DocumentRecord = {
  id: string;
  filename: string;
  status: DocumentStatus;
  uploadedAt: Date;
  analysis?: DocumentAnalysis;
  error?: string;
};

// Transform API response to component format
function transformDocumentFromAPI(apiDoc: any): DocumentRecord {
  let analysis: DocumentAnalysis | undefined;
  
  if (apiDoc.analysis) {
    // Transform from API format to component format
    analysis = {
      dominantElement: apiDoc.analysis.primary_element === 'ether' ? 'aether' : apiDoc.analysis.primary_element,
      elementalBalance: {
        fire: apiDoc.analysis.elemental_breakdown.fire || 0,
        water: apiDoc.analysis.elemental_breakdown.water || 0,
        earth: apiDoc.analysis.elemental_breakdown.earth || 0,
        air: apiDoc.analysis.elemental_breakdown.air || 0,
        aether: apiDoc.analysis.elemental_breakdown.ether || 0
      },
      keyThemes: apiDoc.analysis.key_insights || [],
      shadowAspects: apiDoc.analysis.shadow_themes || [],
      coherenceIndicators: apiDoc.analysis.aether_connections || [],
      aetherResonance: apiDoc.analysis.elemental_breakdown.ether || 0
    };
  }
  
  return {
    id: apiDoc.id,
    filename: apiDoc.filename,
    status: apiDoc.status,
    uploadedAt: new Date(apiDoc.created_at || apiDoc.uploadedAt),
    analysis,
    error: apiDoc.error_message
  };
}

export default function LibraryIntegrationExample() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    
    getCurrentUser();
  }, [supabase]);

  useEffect(() => {
    if (userId) {
      loadDocuments();
      
      // Set up real-time subscription for document status changes
      const subscription = supabase
        .channel('document_changes')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'documents',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            console.log('Document updated:', payload);
            loadDocuments(); // Reload documents when any document is updated
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId, supabase]);

  const loadDocuments = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedDocs = data.map(transformDocumentFromAPI);
      setDocuments(transformedDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleUpload = async (files: FileList) => {
    if (!userId) {
      alert('Please log in to upload documents');
      return;
    }

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          alert(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Create document record with pending status
        const { data: docData, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: userId,
            filename: file.name,
            storage_path: uploadData.path,
            mime_type: file.type,
            file_size: file.size,
            type: getDocumentType(file.type),
            status: 'pending'
          })
          .select()
          .single();

        if (docError) {
          console.error('Document record error:', docError);
          continue;
        }

        // Trigger analysis
        try {
          const response = await fetch('/api/documents/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ documentId: docData.id })
          });

          if (!response.ok) {
            console.error('Analysis request failed:', response.statusText);
          }
        } catch (analysisError) {
          console.error('Analysis request error:', analysisError);
        }
      }

      // Reload documents to show pending uploads
      await loadDocuments();
      
    } catch (error) {
      console.error('Upload process error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = async (documentId: string) => {
    try {
      const response = await fetch('/api/documents/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId })
      });

      if (!response.ok) {
        throw new Error('Retry request failed');
      }

      // Update document status to pending
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'pending', error: undefined }
            : doc
        )
      );

      console.log('Analysis retry initiated for document:', documentId);
    } catch (error) {
      console.error('Retry failed:', error);
      alert('Failed to retry analysis. Please try again.');
    }
  };

  const getDocumentType = (mimeType: string): string => {
    if (mimeType.startsWith('text/')) return 'text';
    if (mimeType === 'application/pdf') return 'document';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    return 'document';
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-white/60 mb-4">Please log in to access your Sacred Library</p>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
            className="px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <SacredLibraryBlooming
        documents={documents}
        onUpload={handleUpload}
        onRetry={handleRetry}
        isUploading={isUploading}
      />
      
      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/50 p-4 rounded-lg text-xs text-white/70 max-w-sm">
          <p>Documents: {documents.length}</p>
          <p>Pending: {documents.filter(d => d.status === 'pending').length}</p>
          <p>Analyzed: {documents.filter(d => d.status === 'analyzed').length}</p>
          <p>Errors: {documents.filter(d => d.status === 'error').length}</p>
          <p>User: {userId?.slice(0, 8)}...</p>
        </div>
      )}
    </div>
  );
}