import { NotebookPanel } from '@jupyterlab/notebook';
import { IM269Context } from '../context';
import { colourise_command } from '../commandIds';

export function registerColourise(ctx: IM269Context): void {
  const { app } = ctx;
  // Colourise command
  app.commands.addCommand(colourise_command, {
    label: 'M269 Colourise',
    caption: 'M269 Colourise',
    execute: async (args: any) => {
      const currentWidget = app.shell.currentWidget;
      if (currentWidget instanceof NotebookPanel) {
        const notebook = currentWidget.content;
        //console.log('Colourising cells');
        for (let i = 0; i < notebook.widgets.length; i++) {
          //console.log(i);
          const currentCell = notebook.widgets[i];
          const meta = currentCell.model.metadata as any;
          const celltype = meta['CELLTYPE'];
          //console.log(celltype);
          if (celltype === 'ANSWER') {
            currentCell.addClass('m269-answer');
          } else if (celltype === "FEEDBACK") {
            currentCell.addClass('m269-feedback');
            if (currentCell.model.type === 'code') {
              notebook.activeCellIndex = i;
              await app.commands.execute('notebook:run-cell');
            }
          } else if (celltype === "MARKCODE") {
            currentCell.addClass('m269-feedback');
            if (currentCell.model.type === 'code') {
              notebook.activeCellIndex = i;
              await app.commands.execute('notebook:run-cell');
            }
          } else if (celltype === "SOLUTION" || celltype === "SECREF" || celltype === "GRADING") {
            currentCell.addClass('m269-tutor');
          }
        }
      }
    }
  });
  // End colourise command
}
