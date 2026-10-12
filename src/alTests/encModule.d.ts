// .enc files are bundled as text (see webpack.config.js)
declare module '*.enc' {
  const content: string;
  export default content;
}
