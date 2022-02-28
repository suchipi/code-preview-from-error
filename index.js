const fs = require("fs");
const path = require("path");
const kleur = require("kleur");
const highlight = require("@babel/highlight").default;
const stripAnsi = require("strip-ansi");

function getLocationFromError(error) {
  const notFound = { filePath: null, lineNumber: -1, columnNumber: -1 };

  try {
    const firstStackLine = (
      error.stack
        ? error.stack
            .split("\n")
            .slice(1)
            .find((line) => /at /.test(line)) || ""
        : ""
    ).trim();

    if (!firstStackLine) return notFound;

    const matches = firstStackLine.match(
      /^at (?:[^ ]+ \()?(?:file:\/\/)?([^\)]+)\)?$/
    );

    if (!matches) return notFound;

    const filePath = matches[1].replace(/:\d+:\d+$/, "");

    const [_, lineNumber = "-1", columnNumber = "-1"] = matches[1].split(":");

    return {
      filePath,
      lineNumber: Number(lineNumber),
      columnNumber: Number(columnNumber),
    };
  } catch (err) {
    // ignored
  }

  return notFound;
}

function codePreviewFromError(error) {
  if (!error.stack) return null;

  const loc = getLocationFromError(error);

  if (loc.filePath == null) return null;
  if (loc.lineNumber == -1) return null;
  if (!fs.existsSync(loc.filePath)) return null;

  const content = fs.readFileSync(loc.filePath, "utf-8");

  const lines = content
    .replace(/\t/g, "  ") // Some terminals print tabs at width 8 by default, which is yuck
    .split("\n")
    .map((line, index) => {
      return {
        lineNumber: index + 1,
        content: line,
      };
    });

  const interestingPart = lines.slice(loc.lineNumber - 3, loc.lineNumber + 3);

  // Remove empty lines from the start
  while (
    interestingPart[0] != null &&
    interestingPart[0].content.trim() === ""
  ) {
    interestingPart.shift();
  }

  // Remove empty lines from the end
  while (
    interestingPart[interestingPart.length - 1] != null &&
    interestingPart[interestingPart.length - 1].content.trim() === ""
  ) {
    interestingPart.pop();
  }

  const previewLines = interestingPart.map(({ lineNumber, content }) => {
    const lastLine = interestingPart[interestingPart.length - 1];

    const maxLineNumberCharWidth = String(lastLine.lineNumber).length;

    const paddedLineNumber = String(lineNumber).padEnd(
      maxLineNumberCharWidth,
      " "
    );

    let maybeTruncatedContent = content;
    if (content.length > 80) {
      maybeTruncatedContent = content.slice(0, 80 - 5 - 3 - 3) + "...";
    }

    return lineNumber === loc.lineNumber
      ? kleur.red(kleur.bold(paddedLineNumber + " > | ")) +
          highlight(maybeTruncatedContent)
      : kleur.dim(
          paddedLineNumber + "   | " + highlight(maybeTruncatedContent)
        );
  });

  const maxLineWidth = previewLines.reduce(
    (prev, curr) => Math.max(prev, stripAnsi(curr).length),
    ""
  );

  const previewHeader = kleur.dim(
    kleur.underline(
      `./${path.relative(process.cwd(), loc.filePath)}:${loc.lineNumber}${
        loc.columnNumber === -1 ? "" : ":" + loc.columnNumber
      }`.padEnd(maxLineWidth, " ")
    )
  );

  return previewHeader + "\n" + previewLines.join("\n");
}

module.exports = Object.assign(codePreviewFromError, {
  codePreviewFromError,
  getLocationFromError,
});
