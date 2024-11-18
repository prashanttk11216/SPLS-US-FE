/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PORT: number;
  readonly VITE_SERVER_URL: string;
  // add more variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
