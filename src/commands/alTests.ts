import { NotebookPanel } from '@jupyterlab/notebook';
import { CodeCell } from '@jupyterlab/cells';
import { IM269Context } from '../context';
import { al_tests_command } from '../commandIds';
import { alTestsRunPath, writeAlTestFile } from '../alTests/writeTestFile';
import { testCalls } from '../tma/testCalls';
import { validateTmaNotebook } from '../tma/validate';

export function registerAlTests(ctx: IM269Context): void {
  const { app, settings, notebookTracker } = ctx;
  // Prepare the AL tests command
  app.commands.addCommand(al_tests_command, {
    label: 'M269 AL Tests',
    caption: 'M269 AL Tests',

    execute: async (args: any) => {
      const currentWidget = notebookTracker.currentWidget;
      const notebookPath = currentWidget?.context.path ?? ""
      console.log("Notebook path:", notebookPath);
      if (!(await writeAlTestFile(ctx, false))) {
        return;
      }
      console.log('File created successfully');
      try {
        if (currentWidget instanceof NotebookPanel) {
          // 1. Put run call in cell 0
          const notebook = currentWidget.content;
          notebook.activeCellIndex = 0;
          notebook.activate();
          await app.commands.execute('notebook:insert-cell-above');
          const cell = notebook.activeCell;
          const code = `%run -i ${alTestsRunPath(settings, notebookPath)}`;
          (cell as CodeCell).model.sharedModel.setSource(code);
          await app.commands.execute('notebook:run-cell');
          // 2. Check TMA number
          const metadata = currentWidget?.context?.model?.metadata;
          console.log('metadata');
          console.log(metadata);
          const tmaNumber = validateTmaNotebook(metadata);
          if (tmaNumber === null) {
            return;
          }
          console.log('Identified as TMA '+metadata["TMANUMBER"]+' Presentation '+metadata["TMAPRES"]);
          // 3. Iterate over dictionary for relevant TMA puttin calls in CELLTYPE:ANSWER with relevant QUESTION at last line.
          const entries = testCalls[tmaNumber];
          if (entries) {
            for (const [key, value] of Object.entries(entries)) {
              console.log(`Key: ${key}, Value: ${value}`);
              for (let i = 0; i < notebook.widgets.length; i++) {
                const currentCell = notebook.widgets[i];
                const meta = currentCell.model.metadata as any;
                const questionKey = meta["QUESTION"];
                const cellType = meta["CELLTYPE"];
                console.log(`Cell ${i}: Type = ${cellType}, Question = ${questionKey}`);
                if (cellType === "ANSWER" && questionKey === key && currentCell.model.type === "code") {
                  console.log('found');
                  let existing = (currentCell as CodeCell).model.sharedModel.getSource();
                  (currentCell as CodeCell).model.sharedModel.setSource(existing + `\n\n`+value);
                }
                if (i == 18 || i == 19 || i == 20) {
                  console.log(cellType);
                  console.log(cellType === "ANSWER");
                  console.log(questionKey);
                  console.log(key)
                  console.log(questionKey === key);
                  console.log(currentCell.model.type)
                  console.log(currentCell.model.type === "code");
                }
              }
            }
          }
          console.log(code);
        } else {
          alert('Error: Could not access NotebookPanel');
          return;
        }
      } catch (err) {
        alert('Failed to create file: '+ err);
        return;
      }
    }
  });
}
