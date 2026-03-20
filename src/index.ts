import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker, NotebookPanel, NotebookActions } from '@jupyterlab/notebook';
import { CodeCell, MarkdownCell } from '@jupyterlab/cells';
import { ContentsManager } from '@jupyterlab/services';
import { Contents } from '@jupyterlab/services';
import { PageConfig } from '@jupyterlab/coreutils';
import { showDialog, Dialog, InputDialog } from '@jupyterlab/apputils';
import { Widget, Menu } from '@lumino/widgets';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { IMainMenu } from '@jupyterlab/mainmenu';

//import { IObservableJSON } from '@jupyterlab/observables';

/**
 * Initialization data for the m269-25j-marking-tool extension.
 */
const prep_command = 'm269-25j-marking-tool:prep';
const colourise_command = 'm269-25j-marking-tool:colourise';
const prep_for_students = 'm269-25j-marking-tool:prep_for_students';
const al_tests_command = 'm269-25j-prep-al-tests';
const open_all_tmas = 'm269-25j-marking-tool:open_all_tmas';
const finish_marking = 'm269-25j-marking-tool:finish_marking';
const set_tests_location_command = 'm269-25j-marking-tool:set_tests_location';
const change_decrypt_key_command = 'm269-25j-marking-tool:change_decrypt_key';
const write_al_test_file_command = 'm269-25j-marking-tool:write_al_test_file';

// Initial code cell code pt 1
const initial_code_cell_pt1 = `import pickle
from IPython.display import display, Markdown, HTML
from typing import TypedDict
import ipywidgets as widgets  # Ensure ipywidgets is imported

class ObserveChange(TypedDict):
    """Type definitios for radio buttons."""

    new: str | None
    old: str | None
    name: str
    owner: widgets.RadioButtons
    type: str

# Dictionary to store marks
pickle_file = "marks.dat"
try:
    with open(pickle_file, "rb") as f:
        question_marks = pickle.load(f)
except FileNotFoundError:
    print('Data file does not exist')`;

// Initial code cell code pt 2
const initial_code_cell_pt2 = `def on_radio_change(
    change: ObserveChange,
    question_id: str,
    _radio_widget: widgets.RadioButtons,
) -> None:
    """React to radio button changes."""
    print('Radio change')
    print(change)
    question_marks[question_id]["awarded"] = change["new"]
    with open("marks.dat", "wb") as f:  # "wb" = write binary mode
        pickle.dump(question_marks, f)

def generate_radio_buttons(question_id: str) -> None:
    """Create radio buttons linked to stored_answers, updating a Markdown cell."""
    if question_id not in question_marks:
        raise ValueError(f"Question {question_id} not found in dictionary")
    previous_selection = question_marks[question_id].get("awarded")

    # Create radio buttons
    radio_buttons = widgets.RadioButtons(
        options = [
            (f"{key} ({question_marks[question_id][key]})", key)
            for key in question_marks[question_id].keys()
            if key != "awarded"
        ],
        description="Grade:",
        disabled=False
    )
    if previous_selection is not None:
        radio_buttons.value = previous_selection  # Restore previous selection
    else:
        radio_buttons.value = None  # Ensure no selection
    # Attach event listener
    radio_buttons.observe(lambda change: on_radio_change(change, question_id,
    radio_buttons), names='value')

    # Display the radio buttons
    display(radio_buttons)


def create_summary_table() -> None:
    """Generate and display an HTML table from the question_marks dictionary."""
    if not question_marks:
        display(HTML("<p>No data available.</p>"))
        return

    # Start the HTML table with styling
    html = """
    <style>
        table {
            border-collapse: collapse;
            width: 100%;
            text-align: center;
        }
        th, td {
            border: 1px solid black;
            padding: 8px;
        }
        .not-selected {
            background-color: #ffcccc;
        }
    </style>
    <table>
        <tr>
            <th>Question</th>
            <th>Fail</th>
            <th>Pass</th>
            <th>Merit</th>
            <th>Distinction</th>
            <th>Awarded</th>
            <th>Marks</th>
        </tr>
    """

    total_marks = 0  # Sum of all selected marks

    # Loop through the dictionary to populate rows
    for question, values in question_marks.items():
        fail = values.get("fail", "-")
        passed = values.get("pass", "-")
        merit = values.get("merit", "-")
        distinction = values.get("distinction", "-")
        awarded = values.get("awarded", None)

        # If marked is None, highlight the cell
        awarded_display = awarded if awarded else "Not Awarded"
        awarded_class = "not-selected" if awarded is None else ""

        if awarded is not None:
            total_marks += values[awarded]  # Add to total
            marks = values[awarded]
        else:
            marks = 0

        html += f"""
        <tr>
            <td>{question}</td>
            <td>{fail}</td>
            <td>{passed}</td>
            <td>{merit}</td>
            <td>{distinction}</td>
            <td class='{awarded_class}'>{awarded_display}</td>
            <td>{marks}</td>
        </tr>
        """

    # Add total row
    html += f"""
    <tr>
        <td colspan='6'><b>Total Marks</b></td>
        <td><b>{total_marks}</b></td>
    </tr>
    """

    html += "</table>"
    # Display the table in the Jupyter Notebook
    display(HTML(html))`;

// Question Marks JSON
// TMA 01
const question_marks_tma01 = `    question_marks = {
        "Q1a": {"fail": 0, "pass": 2, "awarded": None},
        "Q1b": {"fail": 0, "pass": 2, "awarded": None},
        "Q1c": {"fail": 0, "pass": 2, "awarded": None},
        "Q2a": {"fail": 0, "pass": 3, "merit": 6, "distinction": 8, "awarded": None},
        "Q2bi": {"fail": 0, "pass": 5, "merit": 9, "distinction": 13, "awarded": None},
        "Q2bii": {"fail": 0, "pass": 2, "awarded": None},
        "Q2c": {"fail": 0, "pass": 3, "merit": 6, "distinction": 8, "awarded": None},
        "Q2d": {"fail": 0, "pass": 2, "merit": 3, "distinction": 5, "awarded": None},
        "Q3a": {"fail": 0, "pass": 4, "merit": 7, "distinction": 10, "awarded": None},
        "Q3b": {"fail": 0, "pass": 2, "awarded": None},
        "Q4a": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q4b": {"fail": 0, "pass": 2, "merit": 4, "awarded": None},
        "Q5a": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q5b": {"fail": 0, "pass": 3, "merit": 5, "distinction": 8, "awarded": None},
        "Q5c": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q6a": {"fail": 0, "pass": 4, "merit": 7, "distinction": 10, "awarded": None},
        "Q6b": {"fail": 0, "pass": 3, "merit": 6, "awarded": None},
    }`;
// TMA 02
const question_marks_tma02 = `    question_marks = {
        "Q1a": {"fail": 0, "distinction": 2, "awarded": None},
        "Q1b": {"fail": 0, "distinction": 2, "awarded": None},
        "Q1c": {"fail": 0, "distinction": 2, "awarded": None},
        "Q2a": {"fail": 0, "pass": 3, "merit": 6, "distinction": 9, "awarded": None},
        "Q2b": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q2c": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q3a": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q3bi": {"fail": 0, "pass": 1, "distinction": 3, "awarded": None},
        "Q3bii": {"fail": 0, "distinction": 4, "awarded": None},
        "Q4a": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q4b": {"fail": 0, "pass": 2, "distinction": 4, "awarded": None},
        "Q4c": {"fail": 0, "pass": 6, "merit": 10, "distinction": 14, "awarded": None},
        "Q5a": {"fail": 0, "distinction": 2, "awarded": None},
        "Q5b": {"fail": 0, "distinction": 2, "awarded": None},
        "Q5c": {"fail": 0, "distinction": 2, "awarded": None},
        "Q5d": {"fail": 0, "distinction": 2, "awarded": None},
        "Q5e": {"fail": 0, "pass": 1, "merit": 2, "awarded": None},
        "Q5f": {"fail": 0, "distinction": 2, "awarded": None},
        "Q6a": {"fail": 0, "pass": 7, "merit": 12, "distinction": 16, "awarded": None},
        "Q6bi": {"fail": 0, "pass": 2, "distinction": 4, "awarded": None},
        "Q6bii": {"fail": 0, "pass": 2, "distinction": 4, "awarded": None},
    }`
// TMA 03
const question_marks_tma03 = `    question_marks = {
        "Q1a": {"fail": 0, "pass": 3, "merit": 5, "distinction": 7, "awarded": None},
        "Q1b": {"fail": 0, "pass": 3, "distinction": 6, "awarded": None},
        "Q1c": {"fail": 0, "pass": 2, "distinction": 5, "awarded": None},
        "Q1d": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q1e": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q2a": {"fail": 0, "pass": 2, "distinction": 4, "awarded": None},
        "Q2b": {"fail": 0, "pass": 3, "distinction": 6, "awarded": None},
        "Q2c": {"fail": 0, "pass": 4, "merit": 7, "distinction": 10, "awarded": None},
        "Q2d": {"fail": 0, "pass": 2, "merit": 3, "distinction": 4, "awarded": None},
        "Q2e": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q3a": {"fail": 0, "pass": 3, "awarded": None},
        "Q3b": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q4a": {"fail": 0, "pass": 2, "merit": 3, "distinction": 4, "awarded": None},
        "Q4b": {"fail": 0, "pass": 3, "merit": 6, "distinction": 8, "awarded": None},
        "Q4c": {"fail": 0, "pass": 3, "merit": 6, "distinction": 8, "awarded": None},
        "Q4d": {"fail": 0, "pass": 3, "merit": 6, "distinction": 8, "awarded": None},
        "Q5" : {"fail": 0, "pass": 3, "awarded": None},
    }`;

// Testing calls
const testCalls: Record<number, Record<string, string>> = {
  1: {
    'Q2bi' : `try: # allowed
    test(find_client_surname, al_test_table_tma01_q2bi)
except NameError:
    print('Function not defined.')`,
    'Q3a'  : `try: # allowed
    test(find_occurrences_with_follow_on, al_test_table_tma01_q3a)
except NameError:
    print('Function not defined.')`,
    'Q4a'  : `al_tests_tma01_q4a()`,
    'Q5b'  : `try: # allowed
    test(council_decision, al_test_table_tma01_q5b)
except NameError:
    print('Function not defined.')`,
    'Q6a'  : `try: # allowed
    test(weighted_council_decision, al_test_table_tma01_q6a)
except NameError:
    print('Function not defined.')`
  },
  2: {
    'Q2a'  : 'test(power, al_test_table_tma02_q2a)',
    'Q4c' : 'al_test_tma02_q4biii()',
    'Q6a'  : 'al_test_tma02_q6a()'
  },
  3: {
    'Q1a'  : 'al_test_tma03_q1a()',
    'Q1d'  : 'al_test_tma03_q1d()',
    'Q2d'  : 'al_test_tma03_q2d()',
    'Q4d'  : 'al_tests_tma03_q4d()'
  }
};


// Walk through root dir looking for files
async function walkDir(
  contents: Contents.IManager,
  path: string,
  collected: string[] = []
): Promise<string[]> {
  const listing = await contents.get(path, { content: true });

  if (listing.type === 'directory' && listing.content) {
    for (const item of listing.content) {
      if (item.type === 'directory') {
        await walkDir(contents, item.path, collected);
      } else if (item.type === 'notebook' && item.path.endsWith('.ipynb')) {
        collected.push(item.path);
      }
    }
  }
  return collected;
}


export async function decrypt(keyText: string): Promise<string> {
  // Replace this with your encrypted base64-encoded string
  const ENCRYPTED_BASE64 ="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";
  const encryptedBytes = Uint8Array.from(atob(ENCRYPTED_BASE64), c => c.charCodeAt(0));
  const iv = encryptedBytes.slice(0, 12);
  const ciphertext = encryptedBytes.slice(12);

  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyText);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decryptedBuffer);
}

function getSetting(settings: ISettingRegistry.ISettings, key: string, default_value: string): string {
  try {
    const value = settings.get(key).composite;
    return typeof value === 'string' ? value : '';
  } catch (err) {
    console.warn(`Error reading setting "${key}":`, err);
    return default_value;
  }
}

function htmlTableToMarkdown(html: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const table = doc.querySelector("table");
    if (!table) {
        throw new Error("No <table> found in HTML");
    }

    const rows = Array.from(table.querySelectorAll("tr"));
    const extractText = (el: Element) =>
        el.textContent?.trim().replace(/\s+/g, " ") ?? "";

    const mdRows = rows.map(row => {
        const cells = Array.from(row.children).map(extractText);
        return `| ${cells.join(" | ")} |`;
    });

    const firstRow = rows[0];
    const hasHeader = firstRow.querySelector("th") !== null;

    if (hasHeader) {
        const headerCellCount = firstRow.children.length;
        const separator = `| ${Array(headerCellCount).fill("---").join(" | ")} |`;
        mdRows.splice(1, 0, separator);
    }

    return mdRows.join("\n");
}

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'm269-25j-marking-tool:plugin',
  description: 'A tutor marking tool for M269 in the 25J presentation',
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker, ISettingRegistry, IDocumentManager, IMainMenu as any],
  activate: async (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    notebookTracker: INotebookTracker,
    settingRegistry: ISettingRegistry,
    docManager: IDocumentManager,
    mainMenu: IMainMenu
  ) => {
    console.log('JupyterLab extension m269-25j-marking-tool is activated! hurrah');
    console.log('Loading settings registry');
    const settings = await settingRegistry.load('m269-25j-marking-tool:plugin');
    console.log('Loading colours');
    const answer_colour = getSetting(settings,'answer_colour','rgb(255, 255, 204)');
    const feedback_colour = getSetting(settings,'feedback_colour','rgb(93, 163, 243)');
    const tutor_colour = getSetting(settings,'tutor_colour','rgb(249, 142, 142)');
    console.log('Answers: '+answer_colour);
    console.log('Feedback: '+feedback_colour);
    console.log('Tutor: '+tutor_colour);
    // Inject custom styles
    const style = document.createElement('style');
    /*style.textContent = `
      .m269-answer {
        background-color:rgb(255, 255, 204) !important;
      }
      .m269-feedback {
        background-color:rgb(93, 163, 243) !important;
      }
      .m269-tutor {
        background-color: rgb(249, 142, 142) !important;
      }
    `;*/
    style.textContent = `
      .m269-answer {
        background-color:`+answer_colour+` !important;
      }
      .m269-feedback {
        background-color:`+feedback_colour+` !important;
      }
      .m269-tutor {
        background-color: `+tutor_colour+` !important;
      }
    `;
    document.head.appendChild(style);

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
          if (!metadata) {
            console.error('Notebook metadata is undefined');
            return;
          }
          if (metadata["TMANUMBER"] != 1 && metadata["TMANUMBER"] != 2 && metadata["TMANUMBER"] != 3) {
            alert("Could not identify TMA number.");
            return;
          }
          if (metadata["TMAPRES"] != "25J") {
            alert("This tool is only for presentation 25J. This TMA not identifiable as a 25J assessment.");
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
            let question_marks = "";
            if (metadata["TMANUMBER"] == 1) {
              question_marks = question_marks_tma01;
            } else if (metadata["TMANUMBER"] == 2) {
              question_marks = question_marks_tma02;
            } else if (metadata["TMANUMBER"] == 3) {
              question_marks = question_marks_tma03;
            } else {
              alert("TMA Not identified from metadata");
              return;
            }
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
          if (!metadata) {
            console.error('Notebook metadata is undefined');
            return;
          }
          if (metadata["TMANUMBER"] != 1 && metadata["TMANUMBER"] != 2 && metadata["TMANUMBER"] != 3) {
            alert("Could not identify TMA number.");
            return;
          }
          if (metadata["TMAPRES"] != "25J") {
            alert("This tool is only for presentation 25J. This TMA not identifiable as a 25J assessment.");
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

    async function ensurePopupsAllowed(): Promise<boolean> {
      // 1) Try to open a harmless placeholder immediately (sync).
      // If it returns null, the browser blocked it.
      const testWin = window.open('about:blank', '_blank');

      if (!testWin) {
        // 2) Build site/origin string for instructions
        //const baseUrl = PageConfig.getBaseUrl();          // e.g. "/user/olih/lab"
        const origin  = window.location.origin;           // e.g. "https://yourhub.example.org"
        //const site    = `${origin}${baseUrl}`.replace(/\/lab\/?$/, ''); // hub root-ish

        const body = document.createElement('div');
        body.innerHTML = `
          <p><b>Pop-ups are blocked</b> for <code>${origin}</code>. To open multiple notebooks automatically, please allow pop-ups for this site, then click <b>Try again</b>.</p>
          <details open>
            <summary><b>How to allow pop-ups</b></summary>
            <ul style="margin-top:0.5em">
              <li><b>Check your address bar:</b> There may be an option to whitelist popups.</li>
              <li><b>Chrome / Edge (Chromium):</b> Click the icon to left of address bar → <i>Site settings</i> → set <i>Pop-ups and redirects</i> to <b>Allow</b> for <code>${origin}</code>. Then close the tab to return.</li>
              <li><b>Firefox:</b> Preferences → <i>Privacy &amp; Security</i> → <i>Permissions</i> → uncheck <i>Block pop-up windows</i> or add an exception for <code>${origin}</code>.</li>
              <li><b>Safari (macOS):</b> Safari → Settings → <i>Websites</i> → <i>Pop-up Windows</i> → for <code>${origin}</code>, choose <b>Allow</b>. Or “Settings for This Website…” from the address bar.</li>
            </ul>
          </details>
          <p style="margin-top:0.5em">Tip: some extensions (ad blockers, privacy tools) also block pop-ups; whitelist this site there if needed.</p>
        `;
        const bodyWidget = new Widget({ node: body });

        const result = await showDialog({
          title: 'Allow pop-ups to open notebooks',
          body: bodyWidget,
          //buttons: [Dialog.cancelButton({ label: 'Cancel' }), Dialog.okButton({ label: 'Try again' })]
          buttons: [Dialog.cancelButton({ label: 'Cancel' })]
        });

        return result.button.accept;
      } else {
        // 3) We had permission—tidy up and continue
        try { testWin.close(); } catch { /* ignore */ }
        return true;
      }
    }

    // Prepare the AL tests command
    app.commands.addCommand(al_tests_command, {
      label: 'M269 AL Tests',
      caption: 'M269 AL Tests',
      
      execute: async (args: any) => {
        const contents = new ContentsManager();
        const currentWidget = notebookTracker.currentWidget;
        if (currentWidget) {
          const notebookPath = currentWidget.context.path; // e.g. "subdir/notebook.ipynb"
          console.log("Notebook path:", notebookPath);
        }
        const notebookPath = currentWidget?.context.path ?? ""
        const upLevels = notebookPath.split("/").length - 1;
        const relPathToRoot = Array(upLevels).fill("..").join("/");
        const testsLocation = getSetting(settings, 'tests_location', '');
        const filePath = testsLocation ? `${testsLocation}/al_tests.py` : 'al_tests.py';
        const fullPath = testsLocation
          ? (relPathToRoot ? `${relPathToRoot}/${testsLocation}/al_tests.py` : `${testsLocation}/al_tests.py`)
          : (relPathToRoot ? `${relPathToRoot}/al_tests.py` : 'al_tests.py');
        let fileContent: string;
        try {
          let decryptKey = getSetting(settings, 'decrypt_key', '');
          if (!decryptKey || decryptKey.length !== 16) {
            const entered = prompt("Enter 16-character decryption key:");
            if (!entered || entered.length !== 16) {
              alert("Invalid key. Must be exactly 16 characters.");
              return;
            }
            decryptKey = entered;
            await settings.set('decrypt_key', decryptKey);
          }
          fileContent = await decrypt(decryptKey);
        } catch (err) {
          alert("Decryption failed: " + (err instanceof Error ? err.message : err));
          return;
        }
        try {
          await contents.save(filePath, {
            type: 'file',
            format: 'text',
            content: fileContent
          });
          console.log('File created successfully');
          if (currentWidget instanceof NotebookPanel) {
            // 1. Put run call in cell 0
            const notebook = currentWidget.content;
            notebook.activeCellIndex = 0;
            notebook.activate();
            await app.commands.execute('notebook:insert-cell-above');
            const cell = notebook.activeCell;
            const code = `%run -i ${fullPath}`;
            (cell as CodeCell).model.sharedModel.setSource(code);
            await app.commands.execute('notebook:run-cell');
            // 2. Check TMA number
            const metadata = currentWidget?.context?.model?.metadata;
            console.log('metadata');
            console.log(metadata);
            console.log(metadata["TMANUMBER"]);
            if (!metadata) {
              console.error('Notebook metadata is undefined');
              return;
            }
            if (metadata["TMANUMBER"] != 1 && metadata["TMANUMBER"] != 2 && metadata["TMANUMBER"] != 3) {
              alert("Could not identify TMA number.");
              return;
            }
            if (metadata["TMAPRES"] != "25J") {
              alert("This tool is only for presentation 25J. This TMA not identifiable as a 25J assessment.");
              return;
            }
            console.log('Identified as TMA '+metadata["TMANUMBER"]+' Presentation '+metadata["TMAPRES"]);
            // 3. Iterate over dictionary for relevant TMA puttin calls in CELLTYPE:ANSWER with relevant QUESTION at last line.
            const tmaNumber = metadata["TMANUMBER"];
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

    // Open all TMAs
    app.commands.addCommand(open_all_tmas, {
            label: 'M269 Open All TMAs',
      caption: 'M269 Open All TMAs',
      
      execute: async (args: any) => {
        // Ask for popup permission (or instructions if blocked)
        const ok = await ensurePopupsAllowed();
        if (!ok) return; // user cancelled
        //alert('OK');
        const contents = app.serviceManager.contents;
        // 1) collect all notebooks from the Jupyter root
        let notebooks = await walkDir(contents, ''); // '' = root

        notebooks = notebooks.filter(path => !path.includes('-UNMARKED'));

        // DEBUG
        const baseUrl = PageConfig.getBaseUrl();
        console.log('OPEN ALL DEBUGGING START');
        for (const path of notebooks) {
          const url = baseUrl + 'lab/tree/' + encodeURIComponent(path);
          console.log('>> '+url);
        }
        console.log('OPEN ALL DEBUGGING END');


        // END DEBUG

        // (optional) sanity check so you don't open hundreds at once
        if (notebooks.length > 20) {
          const ok = window.confirm(
            `Found ${notebooks.length} notebooks. Open them all in new tabs?`
          );
          if (!ok) return;
        }
        
        // 2) open each notebook in a new browser tab
        //const baseUrl = PageConfig.getBaseUrl();
        for (const path of notebooks) {
          const url = baseUrl + 'lab/tree/' + encodeURIComponent(path);
          window.open(url, '_blank');
        }

        alert(`Opened ${notebooks.length} notebooks in new tabs.\mIf they didn't open, enable popups for this site and try again.`);   
      }
    });

    // Set tests location command
    app.commands.addCommand(set_tests_location_command, {
      label: 'M269 Set Tests Location',
      caption: 'M269 Set Tests Location',
      execute: async () => {
        const current = getSetting(settings, 'tests_location', '');
        const result = await InputDialog.getText({
          title: 'Set Tests Location',
          label: 'Enter a readable and writable directory path:',
          placeholder: '/path/to/tests',
          text: current
        });
        if (!result.button.accept || result.value === null) {
          return;
        }
        const path = result.value.trim();
        if (!path) {
          await showDialog({ title: 'Invalid Path', body: 'Path cannot be empty.', buttons: [Dialog.okButton()] });
          return;
        }
        // Validate readable: try to get the directory
        const contents = app.serviceManager.contents;
        try {
          const item = await contents.get(path, { content: false });
          if (item.type !== 'directory') {
            await showDialog({ title: 'Invalid Path', body: `"${path}" is not a directory.`, buttons: [Dialog.okButton()] });
            return;
          }
        } catch {
          await showDialog({ title: 'Invalid Path', body: `Cannot read "${path}". Check the path exists and is accessible.`, buttons: [Dialog.okButton()] });
          return;
        }
        // Validate writable: try to save and delete a temp file
        const tmpPath = path.replace(/\/$/, '') + '/m269_write_test.tmp';
        try {
          await contents.save(tmpPath, { type: 'file', format: 'text', content: '' });
          await contents.delete(tmpPath);
        } catch {
          await showDialog({ title: 'Invalid Path', body: `"${path}" does not appear to be writable.`, buttons: [Dialog.okButton()] });
          return;
        }
        await settings.set('tests_location', path);
        await showDialog({ title: 'Tests Location Saved', body: `Tests location set to: ${path}`, buttons: [Dialog.okButton()] });
      }
    });
    // End set tests location command

    app.commands.addCommand(change_decrypt_key_command, {
      label: 'M269 Change Decrypt Key',
      caption: 'M269 Change Decrypt Key',
      execute: async () => {
        const current = getSetting(settings, 'decrypt_key', '');
        const result = await InputDialog.getText({
          title: 'Change Decrypt Key',
          label: 'Enter decryption key:',
          text: current
        });
        if (!result.button.accept || result.value === null) {
          return;
        }
        await settings.set('decrypt_key', result.value);
      }
    });
    // End change decrypt key command

    app.commands.addCommand(write_al_test_file_command, {
      label: 'M269 Write AL Test File',
      caption: 'M269 Write AL Test File',
      execute: async () => {
        let decryptKey = getSetting(settings, 'decrypt_key', '');
        if (!decryptKey) {
          const result = await InputDialog.getText({
            title: 'Decryption Key Required',
            label: 'Enter decryption key:',
          });
          if (!result.button.accept || !result.value) {
            return;
          }
          decryptKey = result.value;
          await settings.set('decrypt_key', decryptKey);
        }
        let fileContent: string;
        try {
          fileContent = await decrypt(decryptKey);
        } catch (err) {
          await showDialog({
            title: 'Decryption Failed',
            body: 'Could not decrypt the test file. Check your decryption key.',
            buttons: [Dialog.okButton()]
          });
          return;
        }
        const testsLocation = getSetting(settings, 'tests_location', '');
        const filePath = testsLocation ? `${testsLocation}/al_tests.py` : 'al_tests.py';
        try {
          await app.serviceManager.contents.save(filePath, {
            type: 'file',
            format: 'text',
            content: fileContent
          });
          await showDialog({
            title: 'AL Test File Written',
            body: `Successfully wrote al_tests.py to: ${filePath}`,
            buttons: [Dialog.okButton()]
          });
        } catch (err) {
          await showDialog({
            title: 'Write Failed',
            body: `Could not write file to "${filePath}": ${err instanceof Error ? err.message : err}`,
            buttons: [Dialog.okButton()]
          });
        }
      }
    });
    // End write AL test file command

    const category = 'M269-25j';
    // Add commands to pallette
    palette.addItem({ command: prep_command, category, args: { origin: 'from palette' } });
    palette.addItem({ command: colourise_command, category, args: { origin: 'from palette' } });
    palette.addItem({ command: prep_for_students, category, args: { origin: 'from palette' } });
    palette.addItem({ command: al_tests_command, category, args: {origin: 'from palette' }});
    palette.addItem({ command: open_all_tmas, category, args: {origin: 'from palette' }});
    palette.addItem({ command: finish_marking, category, args: {origin: 'from palette' }});
    palette.addItem({ command: set_tests_location_command, category, args: {origin: 'from palette' }});
    palette.addItem({ command: change_decrypt_key_command, category, args: {origin: 'from palette' }});
    palette.addItem({ command: write_al_test_file_command, category, args: {origin: 'from palette' }});

    // Add M269 menu to menubar
    const menu = new Menu({ commands: app.commands });
    menu.title.label = 'M269';
    menu.addItem({ command: prep_command });
    menu.addItem({ command: colourise_command });
    menu.addItem({ command: finish_marking });
    mainMenu.addMenu(menu as any, true, { rank: 1000 });
  }
};

export default plugin;
