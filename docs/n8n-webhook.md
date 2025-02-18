# n8n Webhook Integration Guide

## Overview
The n8n Webhook node allows external services to trigger n8n workflows and receive data. This document outlines key aspects relevant to our front-end implementation for document uploads and queries.

## Key Points for Our Implementation

### Payload Size Limit
- Maximum payload size: 16MB
- For self-hosted instances, this can be modified using `N8N_PAYLOAD_SIZE_MAX`

### Response Handling
The webhook can respond in three ways:
1. Immediately (returns "Workflow got started")
2. When Last Node Finishes (returns data from last node)
3. Using 'Respond to Webhook' Node (custom response)

### Important Headers
- Content-Type: `multipart/form-data` for file uploads, `application/json` for queries
- No authentication headers required for public webhooks
- CORS headers are handled by n8n

### File Upload Considerations
For our document upload implementation:
1. Use POST method
2. Send file in FormData
3. Include metadata like filename and type
4. Handle binary data appropriately

### Error Handling
Common HTTP status codes to handle:
- 500: Internal Server Error
- 413: Payload Too Large (if file exceeds 16MB)
- 400: Bad Request (malformed data)

## Current Implementation Notes

### Document Upload
```typescript
formData.append('file', file);
formData.append('client_id', clientId);
formData.append('action', 'document_upload');
formData.append('file_name', file.name);
formData.append('file_type', file.type);
```

### Query Request
```typescript
{
  client_id: clientId,
  action: 'query_request',
  query: query
}
```

## Development vs Production
n8n provides different webhook URLs for testing and production:
- Test URL: For development and testing
- Production URL: For activated workflows

## CORS Configuration
n8n handles CORS through the "Allowed Origins" setting:
- Default: `*` (allows all origins)
- Can be restricted to specific domains
- No additional CORS configuration needed on our end

## Best Practices
1. Always check file size before upload
2. Implement proper error handling
3. Show upload progress to users
4. Handle timeouts gracefully
5. Implement retry logic for failed requests

## Reference
- [Official n8n Webhook Documentation](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/) 