// Ambient declarations for browserify-resolved assets (.tpl, .css)
// that tsc cannot resolve but browserify stringify handles at bundle time.

declare module '*.tpl' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

// Ambient require for dynamic browserify imports (components, templates, JSON)
// Returns unknown since the actual type depends on the browserify transform.
declare function require(name: string): unknown;
