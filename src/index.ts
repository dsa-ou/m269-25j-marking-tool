import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette } from '@jupyterlab/apputils';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { CodeCell } from '@jupyterlab/cells';
import { ContentsManager } from '@jupyterlab/services';
import { Contents } from '@jupyterlab/services';

//import { IObservableJSON } from '@jupyterlab/observables';

/**
 * Initialization data for the m269-25j-marking-tool extension.
 */
const prep_command = 'm269-25j-marking-tool:prep';
const colourise_command = 'm269-25j-marking-tool:colourise';
const prep_for_students = 'm269-25j-marking-tool:prep_for_students';
const al_tests_command = 'm269-25j-prep-al-tests';
const open_all_tmas = 'm269-25j-marking-tool:open_all_tmas';

// Initial code cell code pt 1
const initial_code_cell_pt1 = `import pickle
from IPython.display import display, Markdown, HTML
import ipywidgets as widgets  # Ensure ipywidgets is imported

# Dictionary to store marks
pickle_file = "marks.dat"
try:
    with open(pickle_file, "rb") as f:
        question_marks = pickle.load(f)
except FileNotFoundError:
    print('Data file does not exist')`;

// Initial code cell code pt 2
const initial_code_cell_pt2 = `def on_radio_change(change, question_id, radio_widget):
    """React to radio button changes."""
    print('Radio change')
    print(change)
    question_marks[question_id]["awarded"] = change["new"]
    with open("marks.dat", "wb") as f:  # "wb" = write binary mode
        pickle.dump(question_marks, f)

def generate_radio_buttons(question_id):
    """Create radio buttons linked to stored_answers, updating a Markdown cell."""
    if question_id not in question_marks:
        raise ValueError(f"Question {question_id} not found in dictionary")
    previous_selection = question_marks[question_id].get("awarded")

    # Create radio buttons
    radio_buttons = widgets.RadioButtons(
        options=[key for key in question_marks[question_id].keys() if key != "awarded"],
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


def create_summary_table():
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
        "Q2a": {"fail": 0, "pass": 2, "merit": 3, "distinction": 5, "awarded": None},
        "Q2bi": {"fail": 0, "pass": 4, "merit": 7, "distinction": 10, "awarded": None},
        "Q2bii": {"fail": 0, "pass": 2, "awarded": None},
        "Q2c": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q2d": {"fail": 0, "pass": 2, "merit": 3, "distinction": 4, "awarded": None},
        "Q3a": {"fail": 0, "pass": 4, "merit": 7, "distinction": 10, "awarded": None},
        "Q3b": {"fail": 0, "pass": 2, "awarded": None},
        "Q4a": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q4b": {"fail": 0, "pass": 2, "merit": 4, "awarded": None},
        "Q5a": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q5b": {"fail": 0, "pass": 3, "merit": 5, "distinction": 8, "awarded": None},
        "Q5c": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q6a": {"fail": 0, "pass": 4, "merit": 7, "distinction": 10, "awarded": None},
        "Q6b": {"fail": 0, "pass": 3, "merit": 6, "distinction": 9, "awarded": None},
        "Q6c": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
    }`;
// TMA 02
const question_marks_tma02 = `    question_marks = {
        "Q1a": {"fail": 0, "pass": 2, "awarded": None},
        "Q1b": {"fail": 0, "pass": 2, "awarded": None},
        "Q1c": {"fail": 0, "pass": 2, "awarded": None},
        "Q2a": {"fail": 0, "pass": 3, "merit": 6, "distinction": 9, "awarded": None},
        "Q2b": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q2c": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q3a": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q3bi": {"fail": 0, "pass": 1, "merit": 3, "awarded": None},
        "Q3bii": {"fail": 0, "pass": 2, "merit": 4, "awarded": None},
        "Q4a": {"fail": 0, "pass": 2, "merit": 4, "distinction": 5, "awarded": None},
        "Q4bi": {"fail": 0, "pass": 1, "merit": 2, "distinction": 3, "awarded": None},
        "Q4bii": {"fail": 0, "pass": 1, "merit": 2, "awarded": None},
        "Q4biii": {"fail": 0, "pass": 6, "merit": 10, "distinction": 14,
         "awarded": None},
        "Q5a": {"fail": 0, "pass": 1, "merit": 2, "awarded": None},
        "Q5b": {"fail": 0, "pass": 1, "merit": 2, "awarded": None},
        "Q5c": {"fail": 0, "pass": 1, "merit": 2, "awarded": None},
        "Q5d": {"fail": 0, "pass": 1, "merit": 2, "awarded": None},
        "Q5e": {"fail": 0, "pass": 1, "merit": 2, "awarded": None},
        "Q5f": {"fail": 0, "pass": 1, "merit": 2, "awarded": None},
        "Q6a": {"fail": 0, "pass": 7, "merit": 12, "distinction": 16, "awarded": None},
        "Q6b": {"fail": 0, "pass": 2, "merit": 3, "distinction": 4, "awarded": None},
        "Q6c": {"fail": 0, "pass": 2, "merit": 4, "awarded": None},
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
    'Q2bi' : 'test(find_client_surname, al_test_table_tma01_q2bi)',
    'Q3a'  : 'test(find_occurrences_with_follow_on, al_test_table_tma01_q3a)',
    'Q4a'  : 'al_tests_tma01_q4a()',
    'Q5b'  : 'test(council_decision, al_test_table_tma01_q5b)',
    'Q6a'  : 'test(weighted_council_decision, al_test_table_tma01_q6a)'
  },
  2: {
    'Q2a'  : 'test(power, al_test_table_tma02_q2a)',
    'Q4biii' : 'al_test_tma02_q4biii()',
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

export async function decrypt(): Promise<string> {
  // Replace this with your encrypted base64-encoded string
  const ENCRYPTED_BASE64 = "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"
  const keyText = prompt("Enter 16-character decryption key:");
  if (!keyText || keyText.length !== 16) {
    throw new Error("Invalid key. Must be exactly 16 characters.");
  }

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

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'm269-25j-marking-tool:plugin',
  description: 'A tutor marking tool for M269 in the 25J presentation',
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette, notebookTracker: INotebookTracker) => {
    console.log('JupyterLab extension m269-25j-marking-tool is activated! hurrah');

    // Inject custom styles
    const style = document.createElement('style');
    style.textContent = `
      .m269-answer {
        background-color:rgb(255, 255, 204) !important;
      }
      .m269-feedback {
        background-color:rgb(93, 163, 243) !important;
      }
      .m269-tutor {
        background-color: rgb(249, 142, 142) !important;
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
          // Duplicate the file
          const oldName = currentWidget.context.path;
          const newName = oldName.replace(/\.ipynb$/, '-UNMARKED.ipynb');
          await app.serviceManager.contents.copy(oldName, newName);
          console.log('Notebook copied successfully:', newName);
          // Insert initial code cell
          notebook.activeCellIndex = 0;
          notebook.activate();
          await app.commands.execute('notebook:insert-cell-above');
          const cell = notebook.activeCell;
          console.log("Getting TMA number");
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
          console.log("inserting marking forms");
          // Insert marking cell after every cell with metadata "QUESTION"
          for (let i = 0; i < notebook.widgets.length; i++) {
            console.log(i);
            const currentCell = notebook.widgets[i];
            const meta = currentCell.model.metadata as any;
            const celltype = meta['CELLTYPE'];
            console.log(celltype);
            const questionValue = meta['QUESTION'];
            console.log(questionValue);
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
                console.log('markdown cell being metadatad');
                (insertedCell as CodeCell).model.sharedModel.setSource(`Feedback:`);
                insertedCell.model.setMetadata('CELLTYPE','FEEDBACK');
              } else {
                console.log('markdown cell cannot be metadatad');
              }
              await app.commands.execute('notebook:run-cell');
              i++; // Skip over inserted cell to avoid infinite loop
            }
          }
          // Insert final code cell at bottom
          //await app.commands.execute('notebook:activate-next-cell');
          notebook.activeCellIndex = notebook.widgets.length -1;

          console.log('Inserting final cell');
          await app.commands.execute('notebook:insert-cell-below');
          console.log('Getting final cell');
          const finalCell = notebook.widgets[notebook.widgets.length - 1];
          console.log(finalCell);
          if (finalCell) {
            console.log('Got final cell');
            console.log(finalCell.model.type);
          } else {
            console.log('Not got final cell');
          }
          if (finalCell && finalCell.model.type === 'code') {
            console.log('got and it is code');
            (finalCell as CodeCell).model.sharedModel.setSource(`create_summary_table()`);
            finalCell.model.setMetadata('CELLTYPE','MARKCODE');

          } else {
            console.log('could not get or not code');
          }
          console.log('activating');
          await app.commands.execute('notebook:run-cell');
          console.log('done');
        }
      }
    });
    // End prep command

    // Colourise command
    app.commands.addCommand(colourise_command, {
      label: 'M269 Colourise',
      caption: 'M269 Colourise',
      execute: async (args: any) => {
        const currentWidget = app.shell.currentWidget;
        if (currentWidget instanceof NotebookPanel) {
          const notebook = currentWidget.content;
          console.log('Colourising cells');
          for (let i = 0; i < notebook.widgets.length; i++) {
            console.log(i);
            const currentCell = notebook.widgets[i];
            const meta = currentCell.model.metadata as any;
            const celltype = meta['CELLTYPE'];
            console.log(celltype);
            if (celltype === 'ANSWER') {
              currentCell.addClass('m269-answer');
            } else if (celltype === "FEEDBACK") {
              currentCell.addClass('m269-feedback');
            } else if (celltype === "MARKCODE") {
              currentCell.addClass('m269-feedback');              
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
        const fullPath = relPathToRoot ? `${relPathToRoot}/al_tests.py` : "al_tests.py";
        let fileContent: string;
        try {
          fileContent = await decrypt();
        } catch (err) {
          alert("Decryption failed: " + (err instanceof Error ? err.message : err));
          return;
        }
        //alert('here');
        const filePath = 'al_tests.py';  // This is in the root folder
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
        //alert('OK');
        const contents = app.serviceManager.contents;
        // 1) collect all notebooks from the Jupyter root
        const notebooks = await walkDir(contents, ''); // '' = root

        // (optional) sanity check so you don't open hundreds at once
        if (notebooks.length > 20) {
          const ok = window.confirm(
            `Found ${notebooks.length} notebooks. Open them all in new tabs?`
          );
          if (!ok) return;
        }

        // 2) open each notebook in a new tab
        for (const path of notebooks) {
          await app.commands.execute('docmanager:open', {
            path,
            // factory: 'Notebook', // usually not needed; default factory works
            activate: false        // keep focus from bouncing; change to true if you want
          });
        }

        // bring the first one to front (optional)
        if (notebooks[0]) {
          await app.commands.execute('docmanager:activate', { path: notebooks[0] });
        }

        alert(`Opened ${notebooks.length} notebooks in new tabs.`);   
              }
    });

    const category = 'M269-25j';
    // Add commands to pallette
    palette.addItem({ command: prep_command, category, args: { origin: 'from palette' } });
    palette.addItem({ command: colourise_command, category, args: { origin: 'from palette' } });
    palette.addItem({ command: prep_for_students, category, args: { origin: 'from palette' } });
    palette.addItem({ command: al_tests_command, category, args: {origin: 'from palette' }});
    palette.addItem({ command: open_all_tmas, category, args: {origin: 'from palette' }});
  }
};

export default plugin;
