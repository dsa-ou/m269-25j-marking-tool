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
const force_write_al_test_file_command = 'm269-25j-marking-tool:force_write_al_test_file';

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

    app.commands.addCommand(force_write_al_test_file_command, {
      label: 'M269 Force Write AL Tests',
      caption: 'M269 Force Write AL Tests',
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
        await app.serviceManager.contents.save(filePath, {
          type: 'file',
          format: 'text',
          content: fileContent
        });
      }
    });

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
    palette.addItem({ command: force_write_al_test_file_command, category, args: {origin: 'from palette' }});

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
