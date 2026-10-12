// Extra webpack rules, merged into JupyterLab's extension build
const path = require('path');

module.exports = {
  module: {
    rules: [
      // Bundle Python files from src/python_files/ as plain text
      { test: /\.py$/, type: 'asset/source' },
      // Bundle the encrypted AL tests (al_tests.enc) as plain text
      { test: /\.enc$/, type: 'asset/source' }
    ]
  },
  resolve: {
    // 'python_files/x.py' always means src/python_files/x.py, whether
    // imported from src/ or the compiled lib/
    alias: { python_files: path.resolve(__dirname, 'src/python_files') }
  }
};
