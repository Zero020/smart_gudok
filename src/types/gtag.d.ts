declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'js',
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export {};