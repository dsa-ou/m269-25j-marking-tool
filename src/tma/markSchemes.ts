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
  'Q1a':   { 'fail': 0, 'pass': 2 },
  'Q1b':   { 'fail': 0, 'pass': 2 },
  'Q1c':   { 'fail': 0, 'pass': 2 },
  'Q2a':   { 'fail': 0, 'pass': 3, 'merit': 6, 'distinction': 8 },
  'Q2bi':  { 'fail': 0, 'pass': 5, 'merit': 9, 'distinction': 13 },
  'Q2bii': { 'fail': 0, 'pass': 2 },
  'Q2c':   { 'fail': 0, 'pass': 3, 'merit': 6, 'distinction': 8 },
  'Q2d':   { 'fail': 0, 'pass': 2, 'merit': 3, 'distinction': 5 },
  'Q3a':   { 'fail': 0, 'pass': 4, 'merit': 7, 'distinction': 10 },
  'Q3b':   { 'fail': 0, 'pass': 2 },
  'Q4a':   { 'fail': 0, 'pass': 2, 'merit': 4, 'distinction': 6 },
  'Q4b':   { 'fail': 0, 'pass': 2, 'merit': 4 },
  'Q5a':   { 'fail': 0, 'pass': 2, 'merit': 4, 'distinction': 6 },
  'Q5b':   { 'fail': 0, 'pass': 3, 'merit': 5, 'distinction': 8 },
  'Q5c':   { 'fail': 0, 'pass': 2, 'merit': 4, 'distinction': 6 },
  'Q6a':   { 'fail': 0, 'pass': 4, 'merit': 7, 'distinction': 10 },
  'Q6b':   { 'fail': 0, 'pass': 3, 'merit': 6 }
};

// TMA 02
const tma02: MarkScheme = {
  'Q1a':   { 'fail': 0, 'distinction': 2 },
  'Q1b':   { 'fail': 0, 'distinction': 2 },
  'Q1c':   { 'fail': 0, 'distinction': 2 },
  'Q2a':   { 'fail': 0, 'pass': 3, 'merit': 6, 'distinction': 9 },
  'Q2b':   { 'fail': 0, 'pass': 2, 'merit': 4, 'distinction': 6 },
  'Q2c':   { 'fail': 0, 'pass': 2, 'merit': 4, 'distinction': 6 },
  'Q3a':   { 'fail': 0, 'pass': 2, 'merit': 4, 'distinction': 6 },
  'Q3bi':  { 'fail': 0, 'pass': 1, 'distinction': 3 },
  'Q3bii': { 'fail': 0, 'distinction': 4 },
  'Q4a':   { 'fail': 0, 'pass': 2, 'merit': 4, 'distinction': 6 },
  'Q4b':   { 'fail': 0, 'pass': 2, 'distinction': 4 },
  'Q4c':   { 'fail': 0, 'pass': 6, 'merit': 10, 'distinction': 14 },
  'Q5a':   { 'fail': 0, 'distinction': 2 },
  'Q5b':   { 'fail': 0, 'distinction': 2 },
  'Q5c':   { 'fail': 0, 'distinction': 2 },
  'Q5d':   { 'fail': 0, 'distinction': 2 },
  'Q5e':   { 'fail': 0, 'pass': 1, 'merit': 2 },
  'Q5f':   { 'fail': 0, 'distinction': 2 },
  'Q6a':   { 'fail': 0, 'pass': 7, 'merit': 12, 'distinction': 16 },
  'Q6bi':  { 'fail': 0, 'pass': 2, 'distinction': 4 },
  'Q6bii': { 'fail': 0, 'pass': 2, 'distinction': 4 }
};

// TMA 03
const tma03: MarkScheme = {
  'Q1a': { 'fail': 0, 'bare pass': 3, 'pass': 4, 'merit': 5, 'distinction': 6 },
  'Q1b': { 'fail': 0, 'bare pass': 2,                        'distinction': 4 },
  'Q1c': { 'fail': 0, 'bare pass': 2,                        'distinction': 4 },
  'Q1d': { 'fail': 0, 'bare pass': 3,            'merit': 5, 'distinction': 6 },
  'Q1e': { 'fail': 0, 'bare pass': 3, 'pass': 4, 'merit': 6, 'distinction': 8 },
  'Q1f': { 'fail': 0, 'bare pass': 3, 'pass': 4, 'merit': 6, 'distinction': 8 },
  'Q2a': { 'fail': 0, 'bare pass': 3,                        'distinction': 6 },
  'Q2b': { 'fail': 0, 'bare pass': 3,                        'distinction': 6 },
  'Q2c': { 'fail': 0, 'bare pass': 4, 'pass': 6, 'merit': 8, 'distinction': 10 },
  'Q3a': { 'fail': 0, 'bare pass': 2,                        'distinction': 4 },
  'Q3b': { 'fail': 0, 'bare pass': 3,            'merit': 5, 'distinction': 6 },
  'Q4a': { 'fail': 0, 'bare pass': 3, 'pass': 4, 'merit': 6, 'distinction': 8 },
  'Q4b': { 'fail': 0, 'bare pass': 3, 'pass': 4, 'merit': 6, 'distinction': 8 },
  'Q4c': { 'fail': 0, 'bare pass': 2,            'merit': 3, 'distinction': 4 },
  'Q4d': { 'fail': 0, 'bare pass': 3, 'pass': 4, 'merit': 6, 'distinction': 8 },
  'Q5':  { 'fail': 0,                                        'distinction': 4 }
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

/**
 * The Python assignment of question_marks for the initial marking cell.
 * Indented as it sits inside the except block that runs when marks.dat
 * does not exist yet.
 */
export function questionMarksPython(scheme: MarkScheme): string {
  const lines = Object.entries(scheme).map(([question, marks]) => {
    const bands = BANDS
      .filter(band => band in marks)
      .map(band => `"${band}": ${marks[band]}`);
    return `        "${question}": {${bands.join(', ')}, "awarded": None},`;
  });
  return `    question_marks = {\n${lines.join('\n')}\n    }`;
}
