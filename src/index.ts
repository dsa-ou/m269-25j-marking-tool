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
const initial_code_cell_pt1 = `import pickle # allowed
from IPython.display import display, Markdown, HTML # allowed
from typing import TypedDict # allowed
import ipywidgets as widgets  # allowed

class ObserveChange(TypedDict):
    """Type definitios for radio buttons."""

    new: str | None
    old: str | None
    name: str
    owner: widgets.RadioButtons
    type: str

# Dictionary to store marks
pickle_file = "marks.dat"
try: # allowed
    with open(pickle_file, "rb") as f: # allowed
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
    with open("marks.dat", "wb") as f:  # "wb" = write binary mode # allowed
        pickle.dump(question_marks, f)

def generate_radio_buttons(question_id: str) -> None:
    """Create radio buttons linked to stored_answers, updating a Markdown cell."""
    if question_id not in question_marks:
        raise ValueError(f"Question {question_id} not found in dictionary") # allowed
    previous_selection = question_marks[question_id].get("awarded")

    # Create radio buttons
    radio_buttons = widgets.RadioButtons( # allowed
        options = [ # allowed
            (f"{key} ({question_marks[question_id][key]})", key) # allowed
            for key in question_marks[question_id].keys() # allowed
            if key != "awarded" # allowed
        ], # allowed
        description="Grade:", # allowed
        disabled=False # allowed
    )
    if previous_selection is not None: # allowed
        radio_buttons.value = previous_selection  # Restore previous selection
    else:
        radio_buttons.value = None  # Ensure no selection
    # Attach event listener
    radio_buttons.observe(lambda change: on_radio_change(change, question_id, # allowed
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
        awarded_display = awarded if awarded else "Not Awarded" # allowed
        awarded_class = "not-selected" if awarded is None else "" # allowed

        if awarded is not None: # allowed
            total_marks += values[awarded]  # Add to total
            marks = values[awarded]
        else:
            marks = 0

        html += """
        <tr>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td class='{}'>{}</td>
            <td>{}</td>
        </tr>
        """.format(
            question,
            fail,
            passed,
            merit,
            distinction,
            awarded_class,
            awarded_display,
            marks
        )

    # Add total row
    html += """
    <tr>
        <td colspan='6'><b>Total Marks</b></td>
        <td><b>{}</b></td>
    </tr>
    """.format(total_marks)

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
        "Q1a": {"fail": 0, "bare pass": 3, "pass": 4, "merit": 5, "distinction": 6,
          "awarded": None},
        "Q1b": {"fail": 0, "bare pass": 2,                        "distinction": 4,
          "awarded": None},
        "Q1c": {"fail": 0, "bare pass": 2,                        "distinction": 4,
          "awarded": None},
        "Q1d": {"fail": 0, "bare pass": 3,            "merit": 5, "distinction": 6,
          "awarded": None},
        "Q1e": {"fail": 0, "bare pass": 3, "pass": 4, "merit": 6, "distinction": 8,
          "awarded": None},
        "Q1f": {"fail": 0, "bare pass": 3, "pass": 4, "merit": 6, "distinction": 8,
          "awarded": None},
        "Q2a": {"fail": 0, "bare pass": 3,                        "distinction": 6,
          "awarded": None},
        "Q2b": {"fail": 0,                 "pass": 3,             "distinction": 6,
          "awarded": None},
        "Q2c": {"fail": 0, "bare pass": 4, "pass": 6, "merit": 8, "distinction": 10,
          "awarded": None},
        "Q3a": {"fail": 0, "bare pass": 2,                        "distinction": 4,
          "awarded": None},
        "Q3b": {"fail": 0, "bare pass": 3,            "merit": 5, "distinction": 6,
          "awarded": None},
        "Q4a": {"fail": 0, "bare pass": 3, "pass": 4, "merit": 6, "distinction": 8,
          "awarded": None},
        "Q4b": {"fail": 0, "bare pass": 3, "pass": 4, "merit": 6, "distinction": 8,
          "awarded": None},
        "Q4c": {"fail": 0, "bare pass": 2,            "merit": 3, "distinction": 4,
          "awarded": None},
        "Q4d": {"fail": 0, "bare pass": 3, "pass": 4, "merit": 6, "distinction": 8,
          "awarded": None},
        "Q5" : {"fail": 0,                                        "distinction": 4,
          "awarded": None},
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
    'Q1a'  : '# Double check in case student removed.\ncheck_tests(q1_your_tests, [Tree, int], max=5)\nprint("\\nChecking student tests against our solution to help grade part (a)...")\ntest(tma03_q1_smallest_product_tutor, q1_your_tests)',
    'Q1e'  : '# Double check in case student removed.\nprint("\\nChecking your code with the public tests...")\ntest(q1_smallest_product, q1_public_tests)\nprint("\\nChecking student code with the hidden tests...")\ntest(q1_smallest_product, tma03_q1_hidden_tests)',
    'Q4a'  : 'print("\\nChecking our TM against the students tests to help grade part (a)...")\ntest_tm(tutor_tm, q4_your_tests)',
    'Q4d'  : '# Double check in case student removed/didnt add.\nprint("\\nChecking your machine with the public tests...")\ntest_tm(your_tm, q4_public_tests)\nprint("\\nChecking your machine with the hidden tests...")\ntest_tm(your_tm, tma03_q4_hidden_tests)'
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
  const ENCRYPTED_BASE64 = "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";
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
