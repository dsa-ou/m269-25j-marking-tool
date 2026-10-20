import { JupyterFrontEnd } from '@jupyterlab/application';
import { Notebook } from '@jupyterlab/notebook';

/**
 * Run the notebook's active cell, unless it is a student ANSWER cell.
 * Any other selected cells are deselected first, as notebook:run-cell runs
 * every selected cell, not just the active one.
 */
export async function runActiveCell(app: JupyterFrontEnd, notebook: Notebook): Promise<void> {
  notebook.deselectAll();
  const cell = notebook.activeCell;
  if (!cell || (cell.model.metadata as any)['CELLTYPE'] === 'ANSWER') {
    return;
  }
  await app.commands.execute('notebook:run-cell');
}
