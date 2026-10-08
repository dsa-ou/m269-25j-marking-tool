import { NotebookPanel } from '@jupyterlab/notebook';
import { IM269Context } from '../context';
import { prep_for_students } from '../commandIds';

export function registerPrepForStudents(ctx: IM269Context): void {
  const { app } = ctx;
  // Prep-for-students command
  app.commands.addCommand(prep_for_students, {
    label: 'M269 Prep for Student (MT)',
    caption: 'M269 Prep for Student (MT)',
    execute: async (args: any) => {
      const currentWidget = app.shell.currentWidget;
      if (currentWidget instanceof NotebookPanel) {
        // Duplicate the file
        const oldName = currentWidget.context.path;
        const masterName = oldName;
        //const newName = oldName.replace(/-Master(?=\.ipynb$)/, "");
        const newName = oldName
          .replace(/-Master(?=\.ipynb$)/, "")
          .replace(/(?=\.ipynb$)/, "-STUDENT");

        await currentWidget.context.save();

        await app.serviceManager.contents.rename(oldName, newName);

        await currentWidget.close();
        
        const newWidget = await app.commands.execute('docmanager:open', {
          path: newName,
          factory: 'Notebook'
        });

        if (newWidget && 'context' in newWidget) {
          await (newWidget as NotebookPanel).context.ready;
        }
        
        await app.serviceManager.contents.copy(newName, masterName);
        
        console.log('Notebook copied successfully:', newName);
        // Iterate backwards over the cells
        const notebook = newWidget.content;
        for (let i = notebook.widgets.length - 1; i >= 0; i--) {
          const cell = notebook.widgets[i];
          const meta = cell.model.metadata as any;
          const celltype = meta['CELLTYPE'];
          // Do something with each cell
          console.log(`Cell ${i} type: ${cell.model.type} - ${celltype}`);
          if (celltype == 'SECREF' || celltype == 'SOLUTION' || celltype == 'GRADING') {
            notebook.activeCellIndex = i;
            await app.commands.execute('notebook:delete-cell');
            console.log('... deleted.');
          }
        }
      }
    }
  });
}
