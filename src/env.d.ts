/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_LINE_CHANNEL_ID: string;
  readonly VITE_LINE_CHANNEL_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
