/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_DOCUMENT_UPLOAD_WEBHOOK_URL: string;
  readonly VITE_QUERY1_REQUEST_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 