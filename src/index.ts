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
            <th>Bare Pass</th>
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
        bare_pass = values.get("bare pass", "-")
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
            <td>{}</td>
            <td class='{}'>{}</td>
            <td>{}</td>
        </tr>
        """.format(
            question,
            fail,
            bare_pass,
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
        <td colspan='7'><b>Total Marks</b></td>
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
        "Q2b": {"fail": 0, "bare pass": 3,                        "distinction": 6,
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
    'Q1a'  : '# Double check in case student removed.\ncheck_tests(q1_your_tests, [Tree, int], max=5)\nprint("\\nChecking student tests against our solution to help grade part (a)...")\ntest(tma03_q1_smallest_product_tutor, q1_your_tests)\nprint("\\nCheck triangles are triangle")\ncheck_triangle_tests(q1_your_tests)',
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
