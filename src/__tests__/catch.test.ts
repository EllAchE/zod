// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { z } from "..";
import { util } from "../helpers";

test("basic catch", () => {
  expect(z.sString().catch("default").parse(undefined)).toBe("default");
});

test("catch fn does not run when parsing succeeds", () => {
  let isCalled = false;
  const cb = () => {
    isCalled = true;
    return "asdf";
  };
  expect(z.sString().catch(cb).parse("test")).toBe("test");
  expect(isCalled).toEqual(false);
});

test("basic catch async", async () => {
  const result = await z.sString().catch("default").parseAsync(1243);
  expect(result).toBe("default");
});

test("catch replace wrong types", () => {
  expect(z.sString().catch("default").parse(true)).toBe("default");
  expect(z.sString().catch("default").parse(true)).toBe("default");
  expect(z.sString().catch("default").parse(15)).toBe("default");
  expect(z.sString().catch("default").parse([])).toBe("default");
  expect(z.sString().catch("default").parse(new Map())).toBe("default");
  expect(z.sString().catch("default").parse(new Set())).toBe("default");
  expect(z.sString().catch("default").parse({})).toBe("default");
});

test("catch with transform", () => {
  const stringWithDefault = z
    .sString()
    .transform((val) => val.toUpperCase())
    .catch("default");
  expect(stringWithDefault.parse(undefined)).toBe("default");
  expect(stringWithDefault.parse(15)).toBe("default");
  expect(stringWithDefault).toBeInstanceOf(z.ZodCatch);
  expect(stringWithDefault._def.innerType).toBeInstanceOf(z.ZodEffects);
  expect(stringWithDefault._def.innerType._def.schema).toBeInstanceOf(
    z.ZodSchema
  );

  type inp = z.input<typeof stringWithDefault>;
  util.assertEqual<inp, unknown>(true);
  type out = z.output<typeof stringWithDefault>;
  util.assertEqual<out, string>(true);
});

test("catch on existing optional", () => {
  const stringWithDefault = z.sString().optional().catch("asdf");
  expect(stringWithDefault.parse(undefined)).toBe(undefined);
  expect(stringWithDefault.parse(15)).toBe("asdf");
  expect(stringWithDefault).toBeInstanceOf(z.ZodCatch);
  expect(stringWithDefault._def.innerType).toBeInstanceOf(z.ZodOptional);
  expect(stringWithDefault._def.innerType._def.innerType).toBeInstanceOf(
    z.ZodString
  );

  type inp = z.input<typeof stringWithDefault>;
  util.assertEqual<inp, unknown>(true);
  type out = z.output<typeof stringWithDefault>;
  util.assertEqual<out, string | undefined>(true);
});

test("optional on catch", () => {
  const stringWithDefault = z.sString().catch("asdf").optional();

  type inp = z.input<typeof stringWithDefault>;
  util.assertEqual<inp, unknown>(true);
  type out = z.output<typeof stringWithDefault>;
  util.assertEqual<out, string | undefined>(true);
});

test("complex chain example", () => {
  const complex = z
    .sString()
    .catch("asdf")
    .transform((val) => val + "!")
    .transform((val) => val.toUpperCase())
    .catch("qwer")
    .removeCatch()
    .optional()
    .catch("asdfasdf");

  expect(complex.parse("qwer")).toBe("QWER!");
  expect(complex.parse(15)).toBe("ASDF!");
  expect(complex.parse(true)).toBe("ASDF!");
});

test("removeCatch", () => {
  const stringWithRemovedDefault = z.sString().catch("asdf").removeCatch();

  type out = z.output<typeof stringWithRemovedDefault>;
  util.assertEqual<out, string>(true);
});

test("nested", () => {
  const inner = z.sString().catch("asdf");
  const outer = z.sObject({ inner }).catch({
    inner: "asdf",
  });
  type input = z.input<typeof outer>;
  util.assertEqual<input, unknown>(true);
  type out = z.output<typeof outer>;
  util.assertEqual<out, { inner: string }>(true);
  expect(outer.parse(undefined)).toEqual({ inner: "asdf" });
  expect(outer.parse({})).toEqual({ inner: "asdf" });
  expect(outer.parse({ inner: undefined })).toEqual({ inner: "asdf" });
});

test("chained catch", () => {
  const stringWithDefault = z.sString().catch("inner").catch("outer");
  const result = stringWithDefault.parse(undefined);
  expect(result).toEqual("inner");
  const resultDiff = stringWithDefault.parse(5);
  expect(resultDiff).toEqual("inner");
});

test("factory", () => {
  z.ZodCatch.create(z.sString(), {
    catch: "asdf",
  }).parse(undefined);
});

test("native enum", () => {
  enum Fruits {
    apple = "apple",
    orange = "orange",
  }

  const schema = z.sObject({
    fruit: z.nativeEnum(Fruits).catch(Fruits.apple),
  });

  expect(schema.parse({})).toEqual({ fruit: Fruits.apple });
  expect(schema.parse({ fruit: 15 })).toEqual({ fruit: Fruits.apple });
});

test("enum", () => {
  const schema = z.sObject({
    fruit: z.enum(["apple", "orange"]).catch("apple"),
  });

  expect(schema.parse({})).toEqual({ fruit: "apple" });
  expect(schema.parse({ fruit: true })).toEqual({ fruit: "apple" });
  expect(schema.parse({ fruit: 15 })).toEqual({ fruit: "apple" });
});

test("reported issues with nested usage", () => {
  const schema = z.sObject({
    string: z.sString(),
    obj: z.sObject({
      sub: z.sObject({
        lit: z.literal("a"),
        subCatch: z.sNumber().catch(23),
      }),
      midCatch: z.sNumber().catch(42),
    }),
    number: z.sNumber().catch(0),
    bool: z.boolean(),
  });

  try {
    schema.parse({
      string: {},
      obj: {
        sub: {
          lit: "b",
          subCatch: "24",
        },
        midCatch: 444,
      },
      number: "",
      bool: "yes",
    });
  } catch (error) {
    const issues = (error as z.ZodError).issues;

    expect(issues.length).toEqual(3);
    expect(issues[0].message).toMatch("string");
    expect(issues[1].message).toMatch("literal");
    expect(issues[2].message).toMatch("boolean");
  }
});

test("catch error", () => {
  let catchError: z.ZodError | undefined = undefined;

  const schema = z.sObject({
    age: z.sNumber(),
    name: z.sString().catch((ctx) => {
      catchError = ctx.error;

      return "John Doe";
    }),
  });

  const result = schema.safeParse({
    age: null,
    name: null,
  });

  expect(result.success).toEqual(false);
  expect(!result.success && result.error.issues.length).toEqual(1);
  expect(!result.success && result.error.issues[0].message).toMatch("number");

  expect(catchError).toBeInstanceOf(z.ZodError);
  expect(
    catchError !== undefined && (catchError as z.ZodError).issues.length
  ).toEqual(1);
  expect(
    catchError !== undefined && (catchError as z.ZodError).issues[0].message
  ).toMatch("string");
});

test("ctx.input", () => {
  const schema = z.sString().catch((ctx) => {
    return String(ctx.input);
  });

  expect(schema.parse(123)).toEqual("123");
});
