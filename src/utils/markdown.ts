export function htmlTableToMarkdown(html: string): string {
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
