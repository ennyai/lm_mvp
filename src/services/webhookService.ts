import axios from 'axios';

interface WebhookResponse {
  results?: any[];
  error?: string;
}

export const webhookService = {
  uploadDocument: async (
    webhookUrl: string,
    clientId: string,
    documentUrl: string,
    token: string
  ): Promise<WebhookResponse> => {
    try {
      const response = await axios.post(
        webhookUrl,
        {
          client_id: clientId,
          action: 'document_upload',
          document_url: documentUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to upload document');
      }
      throw error;
    }
  },

  submitQuery: async (
    webhookUrl: string,
    clientId: string,
    query: string,
    token: string
  ): Promise<WebhookResponse> => {
    try {
      const response = await axios.post(
        webhookUrl,
        {
          client_id: clientId,
          action: 'query_request',
          query: query,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to process query');
      }
      throw error;
    }
  },
}; 