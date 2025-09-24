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
  const ENCRYPTED_BASE64 = "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";
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
