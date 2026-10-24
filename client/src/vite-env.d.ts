/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Address of the backend server, for example http://localhost:5000 */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
