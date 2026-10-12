// Grade bands, in ascending order, with the labels shown in the summary table
export const BANDS = ['fail', 'bare pass', 'pass', 'merit', 'distinction'] as const;
export type Band = typeof BANDS[number];
export const BAND_LABELS: Record<Band, string> = {
  'fail': 'Fail',
  'bare pass': 'Bare Pass',
  'pass': 'Pass',
  'merit': 'Merit',
  'distinction': 'Distinction'
};

// Marks for each band available on a question
export type QuestionMarks = Partial<Record<Band, number>>;
// Question ID (matching the QUESTION cell metadata) → marks
export type MarkScheme = Record<string, QuestionMarks>;

// Total marks available on every TMA
export const TMA_TOTAL = 100;

// TMA 01
const tma01: MarkScheme = {
  'Q1a':    { 'fail': 0, 'bare pass': 3, 'pass': 4, 'merit': 6, 'distinction': 8},
  'Q1bi':   { 'fail': 0, 'bare pass': 4, 'pass': 5, 'merit': 7, 'distinction': 10},
  'Q1bii':  { 'fail': 0, 'bare pass': 3,                        'distinction': 6},
  'Q2a':   { 'fail': 0, 'bare pass': 4, 'pass': 5, 'merit': 7, 'distinction': 9},
  'Q2b':   { 'fail': 0, 'bare pass': 3, 'pass': 4, 'merit': 6, 'distinction': 8},
  'Q3a':   { 'fail': 0, 'bare pass': 4,            'merit': 6, 'distinction': 8},
  'Q3b':   { 'fail': 0,                                        'distinction': 3},
  'Q4a':   { 'fail': 0, 'bare pass': 4, 'pass': 5, 'merit': 8, 'distinction': 12},
  'Q4b':   { 'fail': 0, 'bare pass': 4, 'pass': 5, 'merit': 7, 'distinction': 10},
  'Q5a':   { 'fail': 0, 'bare pass': 4, 'pass': 5, 'merit': 9, 'distinction': 14},
  'Q5b':   { 'fail': 0, 'bare pass': 4, 'pass': 5, 'merit': 8, 'distinction': 12}
};

// TMA 02
const tma02: MarkScheme = {
};

// TMA 03
const tma03: MarkScheme = {
};

export const markSchemes: Record<number, MarkScheme> = {
  1: tma01,
  2: tma02,
  3: tma03
};

/**
 * Check a mark scheme is consistent. Returns a list of problems (empty if OK):
 * every question has a fail band worth 0 and at least one other band, marks
 * rise strictly from band to band, and full marks add up to TMA_TOTAL.
 */
export function checkMarkScheme(scheme: MarkScheme): string[] {
  const problems: string[] = [];
  let total = 0;
  for (const [question, marks] of Object.entries(scheme)) {
    const values = BANDS.filter(band => band in marks).map(band => marks[band] as number);
    if (marks['fail'] !== 0) {
      problems.push(`${question}: fail must be worth 0`);
    }
    if (values.length < 2) {
      problems.push(`${question}: needs at least one band above fail`);
    }
    for (let i = 1; i < values.length; i++) {
      if (values[i] <= values[i - 1]) {
        problems.push(`${question}: marks must increase from band to band`);
        break;
      }
    }
    total += values.length ? values[values.length - 1] : 0;
  }
  if (total !== TMA_TOTAL) {
    problems.push(`full marks add up to ${total}, not ${TMA_TOTAL}`);
  }
  return problems;
}

// Generated Python must fit within this line length, including comments
const MAX_LINE = 79;
const ALLOWED = ' # allowed';

/**
 * Lay out Python items (e.g. '"fail": 0') after a prefix, wrapping onto
 * lines indented by `indent` so that no line, with its trailing
 * ' # allowed', is longer than MAX_LINE.
 */
export function wrapPythonItems(prefix: string, items: string[], suffix: string, indent: string): string[] {
  const lines: string[] = [];
  let line = prefix;
  items.forEach((item, i) => {
    const piece = item + (i < items.length - 1 ? ',' : suffix);
    const sep = line === prefix || line === indent ? '' : ' ';
    if (line !== prefix && line !== indent &&
        (line + sep + piece + ALLOWED).length > MAX_LINE) {
      lines.push(line + ALLOWED);
      line = indent + piece;
    } else {
      line += sep + piece;
    }
  });
  lines.push(line + ALLOWED);
  return lines;
}

/**
 * The Python assignment of question_marks for the initial marking cell.
 * Indented as it sits inside the except block that runs when marks.dat
 * does not exist yet.
 */
export function questionMarksPython(scheme: MarkScheme): string {
  const lines: string[] = [];
  for (const [question, marks] of Object.entries(scheme)) {
    const items = BANDS
      .filter(band => band in marks)
      .map(band => `"${band}": ${marks[band]}`);
    items.push('"awarded": None');
    lines.push(...wrapPythonItems(`        "${question}": {`, items, '},', '            '));
  }
  return `    question_marks = {${ALLOWED}\n${lines.join('\n')}\n    }`;
}

// The BAND_LABELS assignment for the initial marking cell
export function bandLabelsPython(): string {
  const items = BANDS.map(band => `"${band}": "${BAND_LABELS[band]}"`);
  return wrapPythonItems('BAND_LABELS = {', items, '}', '    ').join('\n');
}
