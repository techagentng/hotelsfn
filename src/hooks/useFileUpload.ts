import { useCallback, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, V1UploadResponse, AIAnalysisResponse } from '@/lib/api';
import { JobsListResponse } from '@/types';

interface FileUploadState {
  file: File | null;
  fileId: string | null;
  status: 'idle' | 'uploading' | 'analyzing' | 'completed' | 'error';
  error?: string;
}


export const useFileUpload = () => {
  const queryClient = useQueryClient();
  const [fileState, setFileState] = useState<FileUploadState>({ 
    file: null, 
    fileId: null, 
    status: 'idle' 
  });
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const lastFileRef = useRef<{ file: File | null; fileId: string | null }>({ 
    file: null, 
    fileId: null 
  });

  // Mutation for uploading a file
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File): Promise<V1UploadResponse> => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      setFileState(prev => ({ ...prev, status: 'uploading' }));
      return api.uploadFile(file, token);
    },
    onSuccess: (data) => {
      setFileState(prev => ({
        ...prev,
        fileId: data.data.file_id,
        status: 'analyzing'
      }));
      lastFileRef.current = { 
        file: fileState.file, 
        fileId: data.data.file_id 
      };
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error) => {
      setFileState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      }));
    }
  });

  // Mutation for analyzing a document
  const analyzeDocumentMutation = useMutation({
    mutationFn: async ({
      fileId,
      query = 'Analyze this document'
    }: {
      fileId: string;
      query?: string;
    }): Promise<AIAnalysisResponse> => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      return api.analyzeDocument(fileId, query, token);
    },
    onSuccess: (data) => {
      setAnalysisResult(data.data.answer);
      setFileState(prev => ({
        ...prev,
        status: 'completed'
      }));
    },
    onError: (error) => {
      setFileState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
    }
  });

  // Combined function to handle both upload and analysis
  const uploadAndAnalyze = useCallback(async (file: File, prompt: string = 'Analyze this document and provide a summary') => {
    try {
      // Step 1: Upload the file
      const uploadResponse = await uploadFileMutation.mutateAsync(file);
      const fileId = uploadResponse.data.file_id;
      
      // Step 2: Start analysis
      const analysisResponse = await analyzeDocumentMutation.mutateAsync({
        fileId,
        query: prompt
      });
      
      return {
        fileId,
        analysis: analysisResponse.data.answer
      };
    } catch (error) {
      console.error('Upload and analysis failed:', error);
      throw error;
    }
  }, []);


  return {
    // State
    fileState,
    analysisResult,
    
    // Upload and analysis methods
    uploadFile: uploadFileMutation.mutateAsync,
    analyzeDocument: analyzeDocumentMutation.mutateAsync,
    uploadAndAnalyze,
    
    // Loading states
    isUploading: uploadFileMutation.isPending,
    isAnalyzing: analyzeDocumentMutation.isPending,
    
    // Errors
    uploadError: uploadFileMutation.error,
    analysisError: analyzeDocumentMutation.error,
    
    // Last file reference
    lastFileId: lastFileRef.current?.fileId,
    
    // Reset state
    reset: () => {
      setFileState({ file: null, fileId: null, status: 'idle' });
      setAnalysisResult(null);
    }
  };
};

export default useFileUpload;
