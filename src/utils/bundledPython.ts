// Every .py file in src/python_files/ is bundled into the extension automatically
// ('python_files' is an alias set up in webpack.config.js).

declare global {
  interface ImportMeta {
    webpackContext(
      request: string,
      options: { recursive: boolean; regExp: RegExp }
    ): { keys(): string[]; (key: string): any };
  }
}

const context = import.meta.webpackContext('python_files', { recursive: false, regExp: /\.py$/ });

/**
 * The contents of the bundled Python file with this name (e.g. 'stack.py'),
 * or undefined if there isn't one in src/python_files/.
 */
export function getBundledPython(filename: string): string | undefined {
  const key = `./${filename}`;
  if (!context.keys().includes(key)) {
    return undefined;
  }
  const module = context(key);
  return typeof module === 'string' ? module : module.default;
}
