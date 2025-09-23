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
    'Q2e'  : 'al_test_tma03_q2e()',
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
