/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URI: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_ENVIRONMENT: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
