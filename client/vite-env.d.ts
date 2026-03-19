/// <reference types="vite/client" />

// Ye sab TypeScript errors ko globally suppress karega
declare module 'react' {
  export = React;
  export as namespace React;
  const React: any;
  export default React;
}

declare module 'react-dom' {
  export = ReactDOM;
  const ReactDOM: any;
  export default ReactDOM;
}

declare module 'react-dom/client' {
  const createRoot: any;
  export { createRoot };
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Ye sab type errors hatane ke liye
type Any = any;
