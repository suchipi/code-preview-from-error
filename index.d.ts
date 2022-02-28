declare function codePreviewFromError(error: Error): string | null;

declare function getLocationFromError(error: Error): {
  filePath: string | null;
  lineNumber: number;
  columnNumber: number;
};

type CodePreviewFromErrorModule = typeof codePreviewFromError & {
  codePreviewFromError: typeof codePreviewFromError;
  getLocationFromError: typeof getLocationFromError;
};

declare var mod: CodePreviewFromErrorModule;

export = mod;
