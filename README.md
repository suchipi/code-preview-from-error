# code-preview-from-error

Preview the code an Error came from

This module:

- Parses an Error's `stack` property
- Identifies its location on disk
- If that file exists, it reads it
- Then, it creates a nice string with colors that shows the part of the file where the error was thrown from.

Sample output string:

![sample output of code-preview-from-error](https://user-images.githubusercontent.com/1341513/155920251-7f0d6b46-d8a9-46f1-afd8-233a8a2e2f2b.png)

## License

MIT
