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

// Ambient require for browserify-resolved assets.
// Returns string because the primary use is for .tpl and .css files
// stringified at bundle time. For typed modules, use import = require().
declare function require(name: string): string;
