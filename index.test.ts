// eslint-disable-next-line
import { test, expect } from "vitest";
import codePreviewFromError from "./index";

test("basic test", () => {
  const error = new Error("well that's not good...");

  // blah
  // blaaaaah

  expect(
    codePreviewFromError(error)
      ?.split("\n")
      .map((line) => line.trim())
      .join("\n")
  ).toMatchInlineSnapshot(`
    "./index.test.ts:6:17
    5   | test(\\"basic test\\", () => {
    6 > |   const error = new Error(\\"well that's not good...\\");
    7   |
    8   |   // blah
    9   |   // blaaaaah"
  `);

  const badError = new Error("this one sucks");
  Object.defineProperty(badError, "stack", { value: "" });

  expect(codePreviewFromError(badError)).toMatchInlineSnapshot("null");
});
