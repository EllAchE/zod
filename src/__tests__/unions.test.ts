// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("function parsing", () => {
  const schema = z.sUnion([
    z.sString().refine(() => false),
    z.sNumber().refine(() => false),
  ]);
  const result = schema.safeParse("asdf");
  expect(result.success).toEqual(false);
});

test("union 2", () => {
  const result = z
    .sUnion([z.sNumber(), z.sString().refine(() => false)])
    .safeParse("a");
  expect(result.success).toEqual(false);
});

test("return valid over invalid", () => {
  const schema = z.sUnion([
    z.sObject({
      email: z.sString().email(),
    }),
    z.sString(),
  ]);
  expect(schema.parse("asdf")).toEqual("asdf");
  expect(schema.parse({ email: "asdlkjf@lkajsdf.com" })).toEqual({
    email: "asdlkjf@lkajsdf.com",
  });
});

test("return dirty result over aborted", () => {
  const result = z
    .sUnion([z.sNumber(), z.sString().refine(() => false)])
    .safeParse("a");
  expect(result.success).toEqual(false);
  if (!result.success) {
    expect(result.error.issues).toEqual([
      {
        code: "custom",
        message: "Invalid input",
        path: [],
      },
    ]);
  }
});

test("options getter", async () => {
  const union = z.sUnion([z.sString(), z.sNumber()]);
  union.options[0].parse("asdf");
  union.options[1].parse(1234);
  await union.options[0].parseAsync("asdf");
  await union.options[1].parseAsync(1234);
});

test("readonly union", async () => {
  const options = [z.sString(), z.sNumber()] as const;
  const union = z.sUnion(options);
  union.parse("asdf");
  union.parse(12);
});
