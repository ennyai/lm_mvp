import axios, { InternalAxiosRequestConfig } from 'axios';

interface WebhookResponse {
  results?: any[];
  error?: string;
}

interface UploadProgressCallback {
  (progress: number): void;
}

// Constants
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB in bytes

// Create axios instance with default config
const api = axios.create({
  timeout: 30000, // 30 second timeout
  headers: {
    'Accept': 'application/json'
  }
});

// Add request interceptor for logging
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Log request details
  console.log('Request details:', {
    url: config.url,
    method: config.method,
    headers: config.headers
  });
  return config;
});

// Helper to parse error responses
const parseErrorResponse = (error: any): string => {
  if (axios.isAxiosError(error)) {
    // Log the full error details for debugging
    console.log('Full error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });

    // Check for specific error codes
    if (error.response?.status === 413) {
      return 'File is too large. Maximum size is 16MB.';
    }
    if (error.response?.status === 500) {
      return 'The server encountered an internal error. Please try again later.';
    }
    if (error.response?.status === 400) {
      return 'Invalid request format. Please check your input.';
    }

    // Try to extract meaningful error message
    const errorData = error.response?.data;
    if (typeof errorData === 'string') {
      if (errorData.includes('<!DOCTYPE html>')) {
        // If we got HTML back, try to extract any error message
        const errorMatch = errorData.match(/<pre>(.*?)<\/pre>/);
        if (errorMatch) {
          return `Server Error: ${errorMatch[1]}`;
        }
        return 'Received an error page from the server. This might be a temporary connection issue.';
      }
    }

    return error.response?.data?.message || error.message || 'An unknown error occurred';
  }
  return 'An unexpected error occurred';
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to handle retries
const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 1000,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Only retry on specific errors (like connection issues)
      if (axios.isAxiosError(error) && 
          (error.code === 'ECONNABORTED' ||
           error.code === 'ETIMEDOUT')) {
        if (attempt < retries) {
          if (onRetry) {
            onRetry(attempt, lastError);
          }
          await delay(delayMs * attempt); // Exponential backoff
          continue;
        }
      }
      
      throw error;
    }
  }
  
  throw lastError!;
};

export const webhookService = {
  uploadDocument: async (
    webhookUrl: string,
    clientId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<WebhookResponse> => {
    if (!webhookUrl) {
      throw new Error('Webhook URL is not configured. Please check your environment variables.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of 16MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    }

    // Log file details
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
    });

    return retryOperation(
      async () => {
        // Create FormData with simplified structure for n8n
        const formData = new FormData();
        formData.append('file', file);
        formData.append('data', JSON.stringify({
          client_id: clientId,
          action: 'document_upload',
          file_name: file.name
        }));

        console.log('Making request to:', webhookUrl);

        const response = await api.post(
          webhookUrl,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
              }
            },
          }
        );
        return response.data;
      },
      3,
      2000,
      (attempt, error) => {
        console.log(`Retry attempt ${attempt} after error:`, error.message);
        if (onProgress) {
          onProgress(0);
        }
      }
    ).catch((error) => {
      console.error('Upload error:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Detailed error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          url: error.config?.url,
          method: error.config?.method
        });
      }

      const errorMessage = parseErrorResponse(error);
      throw new Error(`Failed to upload document: ${errorMessage}`);
    });
  },

  submitQuery: async (
    webhookUrl: string,
    clientId: string,
    query: string
  ): Promise<WebhookResponse> => {
    if (!webhookUrl) {
      throw new Error('Webhook URL is not configured. Please check your environment variables.');
    }

    return retryOperation(
      async () => {
        console.log('Making query request to:', webhookUrl);

        const response = await api.post(
          webhookUrl,
          {
            client_id: clientId,
            action: 'query_request',
            query: query,
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
      },
      3,
      2000,
      (attempt, error) => {
        console.log(`Retry attempt ${attempt} after error:`, error.message);
      }
    ).catch((error) => {
      console.error('Query error:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Detailed error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          url: error.config?.url,
          method: error.config?.method
        });
      }

      const errorMessage = parseErrorResponse(error);
      throw new Error(`Failed to process query: ${errorMessage}`);
    });
  },
}; 