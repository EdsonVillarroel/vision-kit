/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Google Analytics global
declare function gtag(
  command: 'event',
  action: string,
  params?: Record<string, unknown>,
): void;

declare function gtag(
  command: 'config',
  targetId: string,
  params?: Record<string, unknown>,
): void;

interface Window {
  gtag?: typeof gtag;
  dataLayer?: unknown[];
}
