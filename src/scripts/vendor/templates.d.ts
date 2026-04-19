declare module '*.tpl' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

// Ambient require for browserify-resolved assets (.tpl, .css, components)
// that tsc cannot resolve but browserify stringify handles at bundle time.
declare function require(name: string): any;
