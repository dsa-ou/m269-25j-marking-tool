import { NotebookPanel } from '@jupyterlab/notebook';
import { showDialog, Dialog } from '@jupyterlab/apputils';
import { CodeCell } from '@jupyterlab/cells';
import { IM269Context } from '../context';
import { prep_command, colourise_command, al_tests_command } from '../commandIds';
import { initial_code_cell_pt1, initial_code_cell_pt2 } from '../python/initialCell';
import { markSchemes, checkMarkScheme, questionMarksPython } from '../tma/markSchemes';
import { validateTmaNotebook } from '../tma/validate';
import { PathExt } from '@jupyterlab/coreutils';   // add at the top of the file
import { Contents } from '@jupyterlab/services';
import { getBundledPython } from '../utils/bundledPython';
import { tmaPythonFiles } from '../tma/pythonFiles';

export function registerPrepForMarking(ctx: IM269Context): void {
  const { app } = ctx;
  // Prep command
  app.commands.addCommand(prep_command, {
    label: 'M269 Prep for Marking',
    caption: 'M269 Prep for Marking',
    execute: async (args: any) => {
      const shellWidget = app.shell.currentWidget;
      if (shellWidget instanceof NotebookPanel) {
        // let, as it is replaced by the copy in the Marked folder
        let currentWidget: NotebookPanel = shellWidget;
        let notebook = currentWidget.content;
        const metadata = currentWidget?.context?.model?.metadata;
        //console.log('metadata');
        //console.log(metadata);
        //console.log(metadata["TMANUMBER"]);
        const tmaNumber = validateTmaNotebook(metadata);
        if (tmaNumber === null) {
          return;
        }
        const problems = checkMarkScheme(markSchemes[tmaNumber]);
        if (problems.length) {
          await showDialog({
            title: `TMA ${tmaNumber} mark scheme has errors`,
            body: problems.join('\n'),
            buttons: [Dialog.okButton()]
          });
          return;
        }
        // Am I in a "Marked" folder? If so I don't need to make it and copy the file in.
        const folder = PathExt.dirname(currentWidget.context.path);   // 'students/A1234567'
        const folderName = PathExt.basename(folder);                  // 'A1234567'
        const inMarkedFolder = folderName === 'Marked';
        if (inMarkedFolder) {
          console.log("Already in marked folder.");
        } else {
          await currentWidget.context.save(); // Save this notebook.

          // Check if we're in the folder. If we're in it, fine. 
          // If we're not, create it. If it exists and we're not in it, stop.
          const contents = app.serviceManager.contents;
          const markedFolder = PathExt.join(folder, 'Marked');   // e.g. 'students/A1234567/Marked'

          // Does it already exist? get() throws if nothing is at that path.
          let exists = true;
          try {
            await contents.get(markedFolder, { content: false });
          } catch {
            exists = false;
          }

          if (exists) {
            await showDialog({
              title: 'Marked folder already exists',
              body: `"${markedFolder}" already exists. For security this won't be copied into it. Either delete the folder or copy the notebook manually into it and open from there.`,
              buttons: [Dialog.okButton()]
            });
            return;
          }

          // Create it
          await contents.save(markedFolder, { type: 'directory' });

        }

        // If we're not *in* Marking, copy the file into marking.
        if (!inMarkedFolder) {
          // Copy this notebook's content into the Marked folder
          const markedPath = PathExt.join(folder, 'Marked', PathExt.basename(currentWidget.context.path));
          const content = currentWidget.context.model.toJSON();
          await app.serviceManager.contents.save(markedPath, { type: 'notebook', format: 'json', content });

          // Close this one and open the copy instead
          currentWidget.close();
          // A kernel left over from an earlier Marked folder at this path (e.g. one that
          // was deleted) would be reused and run in the old folder, so shut it down first
          const oldSession = await app.serviceManager.sessions.findByPath(markedPath);
          if (oldSession) {
            await app.serviceManager.sessions.shutdown(oldSession.id);
          }
          const newWidget = await app.commands.execute('docmanager:open', {
            path: markedPath,
            factory: 'Notebook'
          }) as NotebookPanel;
          await newWidget.context.ready;
          await newWidget.sessionContext.ready;
          app.shell.activateById(newWidget.id);
          // Move the file browser into the Marked folder too
          await app.commands.execute('filebrowser:go-to-path', {
            path: PathExt.join(folder, 'Marked'),
            dontShowBrowser: true
          });
          currentWidget = newWidget;
          notebook = newWidget.content;
        }

        // Copy any images from the folder above into Marked, skipping any already there
        const contents = app.serviceManager.contents;
        const markedDir = PathExt.dirname(currentWidget.context.path);
        const parentDir = PathExt.dirname(markedDir);
        const imagePattern = /\.(jpe?g|png|webp)$/i;
        const parentListing = await contents.get(parentDir, { content: true });
        const markedListing = await contents.get(markedDir, { content: true });
        const alreadyThere = new Set((markedListing.content as Contents.IModel[]).map(item => item.name));
        const skipped: string[] = [];
        for (const item of parentListing.content as Contents.IModel[]) {
          if (item.type === 'directory' || !imagePattern.test(item.name)) {
            continue;
          }
          if (alreadyThere.has(item.name)) {
            skipped.push(item.name);
          } else {
            // Copying into a directory keeps the file's name
            await contents.copy(item.path, markedDir);
          }
        }
        if (skipped.length) {
          await showDialog({
            title: 'Images not copied',
            body: `These images are already in "${markedDir}", so they were not copied again:\n${skipped.join('\n')}`,
            buttons: [Dialog.okButton()]
          });
        }

        // Write a Python file bundled with the tool into the Marked folder,
        // replacing any existing copy. Returns false (after telling the user) if
        // it couldn't.
        const addPythonFile = async (filename: string): Promise<boolean> => {
          const content = getBundledPython(filename);
          if (content === undefined) {
            await showDialog({
              title: 'Python file missing',
              body: `"${filename}" is listed for this TMA but is not in src/python_files/.`,
              buttons: [Dialog.okButton()]
            });
            return false;
          }
          await contents.save(PathExt.join(markedDir, filename), { type: 'file', format: 'text', content });
          return true;
        };

        // Add the Python files this TMA needs
        for (const filename of tmaPythonFiles[tmaNumber] ?? []) {
          if (!(await addPythonFile(filename))) {
            return;
          }
        }

        // Insert initial code cell
        notebook.activeCellIndex = 0;
        notebook.activate();
        await app.commands.execute('notebook:insert-cell-above');
        const cell = notebook.activeCell;
        //console.log("Getting TMA number");
        if (cell && cell.model.type === 'code') {
          const question_marks = questionMarksPython(markSchemes[tmaNumber]);
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
