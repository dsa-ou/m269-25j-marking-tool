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
