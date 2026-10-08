import { NotebookPanel, NotebookActions } from '@jupyterlab/notebook';
import { CodeCell, MarkdownCell } from '@jupyterlab/cells';
import { htmlTableToMarkdown } from '../utils/markdown';
import { validateTmaNotebook } from '../tma/validate';
import { IM269Context } from '../context';
import { finish_marking, colourise_command } from '../commandIds';

export function registerFinishMarking(ctx: IM269Context): void {
  const { app, docManager } = ctx;
  // Finish command
  app.commands.addCommand(finish_marking, {
    label: 'M269 Finish Marking',
    caption: 'M269 Finish Marking',
    execute: async (args: any) => {
      let currentWidget = app.shell.currentWidget;
      if (currentWidget instanceof NotebookPanel) {
        let context = docManager.contextForWidget(currentWidget);
        if (!context) {
          console.warn("Not a document widget");
          return;
        }
        // Run colourise on original notebook first to ensure all MARKCODE cells have fresh outputs
        await app.commands.execute(colourise_command);
        await context.save();
        const content = await context.model.toJSON();

        const oldPath = context.path;
        const newPath = oldPath.replace(/\.ipynb$/, '') + '-MARKED.ipynb';

        await docManager.services.contents.save(newPath, {
          type: 'notebook',
          format: 'json',
          content
        });

        await app.commands.execute('docmanager:open', { path: newPath });
        console.log('Regetting notebook.')
        // Wait until the widget tracker registers the new path
        let widget: NotebookPanel | null = null;
        for (let i = 0; i < 50; i++) {   // retry ~50 times over 1s
          widget = docManager.findWidget(newPath, 'Notebook') as NotebookPanel;
          //console.log(i);
          if (widget) break;
          await new Promise(r => setTimeout(r, 20));
        }

        widget = docManager.findWidget(newPath, 'Notebook') as NotebookPanel;
        if (!widget) {
          console.error('Could not find new widget. Exiting.');
          return;
        }

        await widget.context.ready;

        // Start kernel automatically using the same kernelspec as the original
        const kernelName = (widget.context.model?.metadata?.kernelspec as any)?.name || 'python3';
        await widget.context.sessionContext.changeKernel({ name: kernelName });

        // Focus the -MARKED notebook so notebook:run-cell targets it
        app.shell.activateById(widget.id);

        currentWidget = widget

        //currentWidget = app.shell.currentWidget;

        if (currentWidget instanceof NotebookPanel) {
          context = docManager.contextForWidget(currentWidget);
        } else {
          console.log('Could not get new context');
          return;
        }
        
        const notebook = currentWidget.content;
        const metadata = currentWidget?.context?.model?.metadata;
        console.log('Checking metadata');
        console.log(metadata);
        //console.log(metadata["TMANUMBER"]);
        if (validateTmaNotebook(metadata) === null) {
          return;
        }
        console.log("-- Running mark code cells --");
        // Run mark code cells
        for (let i = 0; i < notebook.widgets.length; i++) {
            const currentCell = notebook.widgets[i];
            const meta = currentCell.model.metadata as any;
            const celltype = meta['CELLTYPE'];
          // console.log(celltype);
            if (celltype === "MARKCODE") {
              notebook.activeCellIndex = i;
              await NotebookActions.run(notebook, widget.context.sessionContext);
            }
        }
        console.log("-- Querying kernel for awarded grades --");
        // Get all awarded grades from kernel as JSON (question_marks is in kernel memory after forward pass)
        let marksData: Record<string, string | null> = {};
        const kernel = widget.context.sessionContext.session?.kernel;
        if (kernel) {
          const future = kernel.requestExecute({
            code: 'import json; print(json.dumps({k: v.get("awarded") for k, v in question_marks.items()}))'
          });
          await new Promise<void>(resolve => {
            future.onIOPub = (msg: any) => {
              if (msg.header.msg_type === 'stream' && msg.content.name === 'stdout') {
                try { marksData = JSON.parse(msg.content.text.trim()); } catch (e) { console.error('Failed to parse marks JSON:', e); }
              }
            };
            future.done.then(() => resolve());
          });
        }
        console.log("marksData:", marksData);

        console.log("-- Removing all marking cells --");
        // Remove all marking cells
        for (let i = notebook.widgets.length-1; i >= 0;  i--) {
            const currentCell = notebook.widgets[i];
            const meta = currentCell.model.metadata as any;
            const celltype = meta['CELLTYPE'];
            if (celltype === "MARKCODE") {
              notebook.activeCellIndex = i;
              if (notebook.activeCell instanceof CodeCell) {
                const cellSrc = (notebook.activeCell as CodeCell).model.sharedModel.getSource();
                const outputs = notebook.activeCell.model.outputs;
                let html = null;
                for (let j = 0; j < outputs.length; j++) {
                  const out = outputs.get(j);
                  const htmlVal = (out as any).data?.['text/html'];
                  if (Array.isArray(htmlVal)) { html = htmlVal.join(''); }
                  else if (typeof htmlVal === 'string') { html = htmlVal; }
                }
                // Look up grade by question ID extracted from cell source
                const qidMatch = cellSrc.match(/generate_radio_buttons\(['"]([^'"]+)['"]\)/);
                const questionId = qidMatch ? qidMatch[1] : null;
                const grade = questionId ? (marksData[questionId] ?? null) : null;
                console.log(`MARKCODE cell qid:${questionId} → grade: ${grade}, hasHtml: ${html !== null}`);
                if (grade != null) {
                  NotebookActions.changeCellType(notebook, 'markdown');
                  const updated = notebook.activeCell as unknown as MarkdownCell | null;
                  if (updated) {
                    (updated as any).model.sharedModel.setSource("Grade awarded: " + grade);
                  }
                } else if (html != null) {
                  NotebookActions.changeCellType(notebook, 'markdown');
                  const updated = notebook.activeCell as unknown as MarkdownCell | null;
                  if (updated) {
                    try {
                      (updated as any).model.sharedModel.setSource(htmlTableToMarkdown(html));
                    } catch (e) {
                      console.error('htmlTableToMarkdown failed:', e);
                      (updated as any).model.sharedModel.setSource(html);
                    }
                  }
                } else {
                  notebook.model?.sharedModel.deleteCell(i);
                }
              }
            } else {
              // al_tests.py
              if (i == 0) {
                notebook.activeCellIndex = i;
                if (notebook.activeCell instanceof CodeCell) {
                  let existing = (currentCell as CodeCell).model.sharedModel.getSource();
                  if (existing.endsWith('al_tests.py')) {
                      notebook.model?.sharedModel.deleteCell(i);
                  }
                }
              }
            }
        }
        await app.commands.execute(colourise_command);
        NotebookActions.renderAllMarkdown(notebook);
        await widget.context.save();
        alert('MARKED file complete. This TMA can be returned.');
      }
    }
  });
  // End finish command
}
