// Validate environment variables
const validateWebhookUrls = () => {
  const documentUploadUrl = import.meta.env.VITE_DOCUMENT_UPLOAD_WEBHOOK_URL;
  const query1RequestUrl = import.meta.env.VITE_QUERY1_REQUEST_WEBHOOK_URL;

  if (!documentUploadUrl) {
    console.error('VITE_DOCUMENT_UPLOAD_WEBHOOK_URL is not configured in environment variables');
  }
  if (!query1RequestUrl) {
    console.error('VITE_QUERY1_REQUEST_WEBHOOK_URL is not configured in environment variables');
  }

  return {
    documentUploadUrl,
    query1RequestUrl,
  };
};

const { documentUploadUrl, query1RequestUrl } = validateWebhookUrls();

export const WEBHOOK_URLS = {
  DOCUMENT_UPLOAD: documentUploadUrl,
  QUERY1_REQUEST: query1RequestUrl,
} as const;

// Log webhook URLs in development
if (import.meta.env.DEV) {
  console.log('Webhook URLs:', {
    DOCUMENT_UPLOAD: WEBHOOK_URLS.DOCUMENT_UPLOAD || 'Not configured',
    QUERY1_REQUEST: WEBHOOK_URLS.QUERY1_REQUEST || 'Not configured',
  });
} 