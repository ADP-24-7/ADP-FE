/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: string;
  readonly VITE_API_MODE?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_LOCAL_BFF_ENABLED?: string;
  readonly VITE_RUNTIME_PROFILE?: string;
  readonly VITE_DATA_PROVENANCE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
