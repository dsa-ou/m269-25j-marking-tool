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
