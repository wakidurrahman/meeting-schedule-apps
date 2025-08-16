declare module 'bootstrap/dist/js/bootstrap.bundle.min.js';

declare global {
  interface Window {
    bootstrap: {
      Modal: new (
        element: HTMLElement,
        options?: {
          backdrop?: boolean | 'static';
          keyboard?: boolean;
          focus?: boolean;
        },
      ) => {
        show(): void;
        hide(): void;
        dispose(): void;
      };
    };
  }
}

export {};
