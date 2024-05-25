// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("valid", () => {
  expect(
    z
      .discriminatedUnion("type", [
        z.sObject({ type: z.literal("a"), a: z.sString() }),
        z.sObject({ type: z.literal("b"), b: z.sString() }),
      ])
      .parse({ type: "a", a: "abc" })
  ).toEqual({ type: "a", a: "abc" });
});

test("valid - discriminator value of various primitive types", () => {
  const schema = z.discriminatedUnion("type", [
    z.sObject({ type: z.literal("1"), val: z.literal(1) }),
    z.sObject({ type: z.literal(1), val: z.literal(2) }),
    z.sObject({ type: z.literal(BigInt(1)), val: z.literal(3) }),
    z.sObject({ type: z.literal("true"), val: z.literal(4) }),
    z.sObject({ type: z.literal(true), val: z.literal(5) }),
    z.sObject({ type: z.literal("null"), val: z.literal(6) }),
    z.sObject({ type: z.literal(null), val: z.literal(7) }),
    z.sObject({ type: z.literal("undefined"), val: z.literal(8) }),
    z.sObject({ type: z.literal(undefined), val: z.literal(9) }),
    z.sObject({ type: z.literal("transform"), val: z.literal(10) }),
    z.sObject({ type: z.literal("refine"), val: z.literal(11) }),
    z.sObject({ type: z.literal("superRefine"), val: z.literal(12) }),
  ]);

  expect(schema.parse({ type: "1", val: 1 })).toEqual({ type: "1", val: 1 });
  expect(schema.parse({ type: 1, val: 2 })).toEqual({ type: 1, val: 2 });
  expect(schema.parse({ type: BigInt(1), val: 3 })).toEqual({
    type: BigInt(1),
    val: 3,
  });
  expect(schema.parse({ type: "true", val: 4 })).toEqual({
    type: "true",
    val: 4,
  });
  expect(schema.parse({ type: true, val: 5 })).toEqual({
    type: true,
    val: 5,
  });
  expect(schema.parse({ type: "null", val: 6 })).toEqual({
    type: "null",
    val: 6,
  });
  expect(schema.parse({ type: null, val: 7 })).toEqual({
    type: null,
    val: 7,
  });
  expect(schema.parse({ type: "undefined", val: 8 })).toEqual({
    type: "undefined",
    val: 8,
  });
  expect(schema.parse({ type: undefined, val: 9 })).toEqual({
    type: undefined,
    val: 9,
  });
});

test("invalid - null", () => {
  try {
    z.discriminatedUnion("type", [
      z.sObject({ type: z.literal("a"), a: z.sString() }),
      z.sObject({ type: z.literal("b"), b: z.sString() }),
    ]).parse(null);
    throw new Error();
  } catch (e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: z.ZodIssueCode.invalid_type,
        expected: z.ZodParsedType.sObject,
        message: "Expected object, received null",
        received: z.ZodParsedType.null,
        path: [],
      },
    ]);
  }
});

test("invalid discriminator value", () => {
  try {
    z.discriminatedUnion("type", [
      z.sObject({ type: z.literal("a"), a: z.sString() }),
      z.sObject({ type: z.literal("b"), b: z.sString() }),
    ]).parse({ type: "x", a: "abc" });
    throw new Error();
  } catch (e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: z.ZodIssueCode.invalid_union_discriminator,
        options: ["a", "b"],
        message: "Invalid discriminator value. Expected 'a' | 'b'",
        path: ["type"],
      },
    ]);
  }
});

test("valid discriminator value, invalid data", () => {
  try {
    z.discriminatedUnion("type", [
      z.sObject({ type: z.literal("a"), a: z.sString() }),
      z.sObject({ type: z.literal("b"), b: z.sString() }),
    ]).parse({ type: "a", b: "abc" });
    throw new Error();
  } catch (e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: z.ZodIssueCode.invalid_type,
        expected: z.ZodParsedType.sString,
        message: "Required",
        path: ["a"],
        received: z.ZodParsedType.undefined,
      },
    ]);
  }
});

test("wrong schema - missing discriminator", () => {
  try {
    z.discriminatedUnion("type", [
      z.sObject({ type: z.literal("a"), a: z.sString() }),
      z.sObject({ b: z.sString() }) as any,
    ]);
    throw new Error();
  } catch (e: any) {
    expect(e.message.includes("could not be extracted")).toBe(true);
  }
});

test("wrong schema - duplicate discriminator values", () => {
  try {
    z.discriminatedUnion("type", [
      z.sObject({ type: z.literal("a"), a: z.sString() }),
      z.sObject({ type: z.literal("a"), b: z.sString() }),
    ]);
    throw new Error();
  } catch (e: any) {
    expect(e.message.includes("has duplicate value")).toEqual(true);
  }
});

test("async - valid", async () => {
  expect(
    await z
      .discriminatedUnion("type", [
        z.sObject({
          type: z.literal("a"),
          a: z
            .sString()
            .refine(async () => true)
            .transform(async (val) => Number(val)),
        }),
        z.sObject({
          type: z.literal("b"),
          b: z.sString(),
        }),
      ])
      .parseAsync({ type: "a", a: "1" })
  ).toEqual({ type: "a", a: 1 });
});

test("async - invalid", async () => {
  try {
    await z
      .discriminatedUnion("type", [
        z.sObject({
          type: z.literal("a"),
          a: z
            .sString()
            .refine(async () => true)
            .transform(async (val) => val),
        }),
        z.sObject({
          type: z.literal("b"),
          b: z.sString(),
        }),
      ])
      .parseAsync({ type: "a", a: 1 });
    throw new Error();
  } catch (e: any) {
    expect(JSON.parse(e.message)).toEqual([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["a"],
        message: "Expected string, received number",
      },
    ]);
  }
});

test("valid - literals with .default or .preprocess", () => {
  const schema = z.discriminatedUnion("type", [
    z.sObject({
      type: z.literal("foo").default("foo"),
      a: z.sString(),
    }),
    z.sObject({
      type: z.literal("custom"),
      method: z.sString(),
    }),
    z.sObject({
      type: z.preprocess((val) => String(val), z.literal("bar")),
      c: z.sString(),
    }),
  ]);
  expect(schema.parse({ type: "foo", a: "foo" })).toEqual({
    type: "foo",
    a: "foo",
  });
});

test("enum and nativeEnum", () => {
  enum MyEnum {
    d,
    e = "e",
  }

  const schema = z.discriminatedUnion("key", [
    z.sObject({
      key: z.literal("a"),
      // Add other properties specific to this option
    }),
    z.sObject({
      key: z.enum(["b", "c"]),
      // Add other properties specific to this option
    }),
    z.sObject({
      key: z.nativeEnum(MyEnum),
      // Add other properties specific to this option
    }),
  ]);

  type schema = z.infer<typeof schema>;

  schema.parse({ key: "a" });
  schema.parse({ key: "b" });
  schema.parse({ key: "c" });
  schema.parse({ key: MyEnum.d });
  schema.parse({ key: MyEnum.e });
  schema.parse({ key: "e" });
});

test("branded", () => {
  const schema = z.discriminatedUnion("key", [
    z.sObject({
      key: z.literal("a"),
      // Add other properties specific to this option
    }),
    z.sObject({
      key: z.literal("b").brand("asdfaf"),
      // Add other properties specific to this option
    }),
  ]);

  type schema = z.infer<typeof schema>;

  schema.parse({ key: "a" });
  schema.parse({ key: "b" });
  expect(() => {
    schema.parse({ key: "c" });
  }).toThrow();
});

test("optional and nullable", () => {
  const schema = z.discriminatedUnion("key", [
    z.sObject({
      key: z.literal("a").optional(),
      a: z.literal(true),
    }),
    z.sObject({
      key: z.literal("b").nullable(),
      b: z.literal(true),
      // Add other properties specific to this option
    }),
  ]);

  type schema = z.infer<typeof schema>;
  z.util.assertEqual<
    schema,
    { key?: "a" | undefined; a: true } | { key: "b" | null; b: true }
  >(true);

  schema.parse({ key: "a", a: true });
  schema.parse({ key: undefined, a: true });
  schema.parse({ key: "b", b: true });
  schema.parse({ key: null, b: true });
  expect(() => {
    schema.parse({ key: null, a: true });
  }).toThrow();
  expect(() => {
    schema.parse({ key: "b", a: true });
  }).toThrow();

  const value = schema.parse({ key: null, b: true });

  if (!("key" in value)) value.a;
  if (value.key === undefined) value.a;
  if (value.key === "a") value.a;
  if (value.key === "b") value.b;
  if (value.key === null) value.b;
});
