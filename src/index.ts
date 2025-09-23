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
        "Q1a": {"fail": 0, "pass": 4, "merit": 7, "distinction": 10, "awarded": None},
        "Q1b": {"fail": 0, "pass": 1, "distinction": 3, "awarded": None},
        "Q1c": {"fail": 0, "pass": 2, "distinction": 5, "awarded": None},
        "Q1d": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q1e": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q2a": {"fail": 0, "pass": 2, "distinction": 4, "awarded": None},
        "Q2b": {"fail": 0, "pass": 3, "distinction": 6, "awarded": None},
        "Q2c": {"fail": 0, "pass": 4, "merit": 7, "distinction": 10, "awarded": None},
        "Q2d": {"fail": 0, "pass": 2, "merit": 3, "distinction": 4, "awarded": None},
        "Q2e": {"fail": 0, "pass": 2, "merit": 4, "distinction": 6, "awarded": None},
        "Q3a": {"fail": 0, "pass": 3, "awarded": None},
        "Q3b": {"fail": 0, "pass": 2, "merit": 3, "distinction": 6, "awarded": None},
        "Q4a": {"fail": 0, "pass": 2, "merit": 6, "distinction": 4, "awarded": None},
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
    'Q2e'  : 'al_test_tma03_q2e()',
    'Q4c'  : 'al_tests_tma03_q4c()'
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
  // Prompt user for 16-character key
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
