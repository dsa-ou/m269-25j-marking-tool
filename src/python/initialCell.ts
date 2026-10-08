// Initial code cell code pt 1
export const initial_code_cell_pt1 = `import pickle # allowed
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
export const initial_code_cell_pt2 = `def on_radio_change(
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
