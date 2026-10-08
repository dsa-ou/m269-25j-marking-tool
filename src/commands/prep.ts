import { NotebookPanel } from '@jupyterlab/notebook';
import { CodeCell } from '@jupyterlab/cells';
import { IM269Context } from '../context';
import { prep_command, colourise_command, al_tests_command } from '../commandIds';
import { initial_code_cell_pt1, initial_code_cell_pt2 } from '../python/initialCell';
import { questionMarks } from '../tma/markSchemes';
import { validateTmaNotebook } from '../tma/validate';

export function registerPrep(ctx: IM269Context): void {
  const { app } = ctx;
  // Prep command
  app.commands.addCommand(prep_command, {
    label: 'M269 Prep for Marking',
    caption: 'M269 Prep for Marking',
    execute: async (args: any) => {
      const currentWidget = app.shell.currentWidget;
      if (currentWidget instanceof NotebookPanel) {
        const notebook = currentWidget.content;
        const metadata = currentWidget?.context?.model?.metadata;
        //console.log('metadata');
        //console.log(metadata);
        //xonsole.log(metadata["TMANUMBER"]);
        const tmaNumber = validateTmaNotebook(metadata);
        if (tmaNumber === null) {
          return;
        }
        // Duplicate the file
        const oldName = currentWidget.context.path;
        const newName = oldName.replace(/\.ipynb$/, '-UNMARKED.ipynb');
        await app.serviceManager.contents.copy(oldName, newName);
        //console.log('Notebook copied successfully:', newName);
        // Insert initial code cell
        notebook.activeCellIndex = 0;
        notebook.activate();
        await app.commands.execute('notebook:insert-cell-above');
        const cell = notebook.activeCell;
        //console.log("Getting TMA number");
        if (cell && cell.model.type === 'code') {
          const question_marks = questionMarks[tmaNumber];
          (cell as CodeCell).model.sharedModel.setSource(`${initial_code_cell_pt1}\n\n${question_marks}\n\n${initial_code_cell_pt2}`);
          cell.model.setMetadata('CELLTYPE','MARKCODE');
          await app.commands.execute('notebook:run-cell');
          if (cell) {
            cell.inputHidden = true;
          }
        }
        //console.log("inserting marking forms");
        // Insert marking cell after every cell with metadata "QUESTION"
        for (let i = 0; i < notebook.widgets.length; i++) {
          //console.log(i);
          const currentCell = notebook.widgets[i];
          const meta = currentCell.model.metadata as any;
          const celltype = meta['CELLTYPE'];
          //console.log(celltype);
          const questionValue = meta['QUESTION'];
          //console.log(questionValue);
          if (celltype == 'TMACODE') {
            notebook.activeCellIndex = i;
            await app.commands.execute('notebook:run-cell');
          }
          if (questionValue !== undefined) {
            notebook.activeCellIndex = i;
            await app.commands.execute('notebook:insert-cell-below');
            let insertedCell = notebook.activeCell;
            if (insertedCell && insertedCell.model.type === 'code') {
              (insertedCell as CodeCell).model.sharedModel.setSource(`# Marking Form
generate_radio_buttons(${JSON.stringify(questionValue)})`);
              insertedCell.model.setMetadata('CELLTYPE','MARKCODE');
            }
            await app.commands.execute('notebook:run-cell');
            i++; // Skip over inserted cell to avoid infinite loop
            
            notebook.activeCellIndex = i;
            await app.commands.execute('notebook:insert-cell-below');
            await app.commands.execute('notebook:change-cell-to-markdown');
            insertedCell = notebook.activeCell;
            if (insertedCell && insertedCell.model.type === 'markdown') {
              //console.log('markdown cell being metadatad');
              (insertedCell as CodeCell).model.sharedModel.setSource(`Feedback:`);
              insertedCell.model.setMetadata('CELLTYPE','FEEDBACK');
            } else {
              //console.log('markdown cell cannot be metadatad');
            }
            await app.commands.execute('notebook:run-cell');
            i++; // Skip over inserted cell to avoid infinite loop
          }
        }
        // Insert final code cell at bottom
        //await app.commands.execute('notebook:activate-next-cell');
        notebook.activeCellIndex = notebook.widgets.length -1;

        //console.log('Inserting final cell');
        await app.commands.execute('notebook:insert-cell-below');
        //console.log('Getting final cell');
        const finalCell = notebook.widgets[notebook.widgets.length - 1];
        //console.log(finalCell);
        if (finalCell) {
          //console.log('Got final cell');
          //console.log(finalCell.model.type);
        } else {
          //console.log('Not got final cell');
        }
        if (finalCell && finalCell.model.type === 'code') {
          //console.log('got and it is code');
          (finalCell as CodeCell).model.sharedModel.setSource(`create_summary_table()`);
          finalCell.model.setMetadata('CELLTYPE','MARKCODE');

        } else {
          //console.log('could not get or not code');
        }
        //console.log('activating');
        await app.commands.execute('notebook:run-cell');
        // Automatically run the colourise command after prep
        await app.commands.execute(colourise_command);
        // Automatically run AL Tests after colourise
        await app.commands.execute(al_tests_command);
        //console.log('done');
      }
    }
  });
  // End prep command
}
