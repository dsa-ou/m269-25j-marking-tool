/**
 * Check notebook metadata identifies a 25J TMA 01-03.
 * Returns the TMA number, or null (after telling the user) if not.
 */
export function validateTmaNotebook(metadata: Record<string, any> | undefined): number | null {
  if (!metadata) {
    console.error('Notebook metadata is undefined');
    return null;
  }
  if (metadata["TMANUMBER"] != 1 && metadata["TMANUMBER"] != 2 && metadata["TMANUMBER"] != 3) {
    alert("Could not identify TMA number.");
    return null;
  }
  if (metadata["TMAPRES"] != "25J") {
    alert("This tool is only for presentation 25J. This TMA not identifiable as a 25J assessment.");
    return null;
  }
  return metadata["TMANUMBER"];
}
