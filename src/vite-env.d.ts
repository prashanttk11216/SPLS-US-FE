/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PORT: number;
  readonly VITE_SERVER_URL: string;
  readonly VITE_GOOGLE_API_KEY: string;
  // add more variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
