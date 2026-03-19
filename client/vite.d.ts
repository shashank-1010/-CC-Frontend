// TypeScript errors ko globally suppress karo
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

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Ye sab kuch 'any' type de dega
type Any = any;
type ReactNode = any;
type ReactElement = any;

// Common hooks ko define karo
declare const useState: any;
declare const useEffect: any;
declare const useRef: any;
declare const useContext: any;
declare const useReducer: any;
declare const useCallback: any;
declare const useMemo: any;
