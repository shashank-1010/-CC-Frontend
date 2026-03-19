declare module 'react' {
    export = React;
    export as namespace React;
    const React: any;
    export default React;
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
