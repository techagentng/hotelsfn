import { JobStatusResponse, JobsListResponse } from '@/types/index';

export interface V1UploadResponse {
  message: string;
  data: {
    file_id: string;
    file_name: string;
    file_type: string;
    status: string;
  };
}

export interface AIAnalysisRequest {
  file_id: string;
  query: string;
}

export interface AIAnalysisResponse {
  data: {
    answer: string;
  };
  errors: string;
  message: string;
  status: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    // Remove trailing slash if present
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  /**
   * Helper to join URL parts and ensure proper slashes
   */
  private buildUrl(endpoint: string): string {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/${cleanEndpoint}`;
  }

  /**
   * Upload a file for processing (v1 API)
   */
  async uploadFile(
    file: File,
    token: string
  ): Promise<V1UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Extract file extension and map to allowed types (csv, pdf, image)
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    let fileType = 'image'; // default to image
    
    if (fileExt === 'pdf') {
      fileType = 'pdf';
    } else if (fileExt === 'csv') {
      fileType = 'csv';
    } else if (file.type.startsWith('image/')) {
      fileType = 'image';
    }
    
    formData.append('type', fileType);

    const response = await fetch(this.buildUrl('upload'), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || `Upload failed with status ${response.status}`);
    }

    return response.json();
  }

  /**
   * Analyze document with AI
   */
  async analyzeDocument(
    fileId: string,
    query: string,
    token: string
  ): Promise<AIAnalysisResponse> {
    try {
      const url = this.buildUrl('ai/analyze');
      const requestBody = {
        file_id: fileId,
        query: query,
        prompt: query,
      };

      console.log('🔍 Sending analysis request:', {
        url,
        method: 'POST',
        body: requestBody
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      let responseData;
      try {
        responseData = await response.json();
        console.log('📥 Analysis response:', responseData);
      } catch (e) {
        console.error('❌ Failed to parse JSON response:', e);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        console.error('❌ Analysis failed:', {
          status: response.status,
          statusText: response.statusText,
          responseData
        });
        
        const errorMessage = responseData?.message || 
                          responseData?.error?.message || 
                          responseData?.error ||
                          `Analysis failed with status ${response.status} ${response.statusText}`;
        
        throw new Error(errorMessage);
      }

      if (!responseData || typeof responseData !== 'object') {
        console.error('❌ Invalid response format:', responseData);
        throw new Error('Invalid response format from analysis service');
      }

      return responseData as AIAnalysisResponse;
    } catch (error) {
      console.error('❌ Error in analyzeDocument:', {
        error,
        fileId,
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      });
      
      if (error instanceof Error) {
        throw error;
      }
      
      if (typeof error === 'string') {
        throw new Error(error);
      }
      
      throw new Error('Failed to analyze document');
    }
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(this.buildUrl(`jobs/${jobId}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all jobs
   */
  async getJobs(
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<JobsListResponse> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${this.buildUrl('jobs')}?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string): Promise<{ success: boolean; message: string }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(this.buildUrl(`jobs/${jobId}/cancel`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete a job
   */
  async deleteJob(jobId: string): Promise<{ success: boolean; message: string }> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const response = await fetch(this.buildUrl(`jobs/${jobId}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const api = new APIClient(API_BASE_URL);
