export {};

declare global {
  interface Window {
    storage?: {
      get: (key: string) => string | null;
      set: (key: string, value: string) => void;
    };
  }
}
