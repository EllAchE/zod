// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers";
import * as z from "../index";

const Test = z.sObject({
  f1: z.sNumber(),
  f2: z.sString().optional(),
  f3: z.sString().nullable(),
  f4: z.sArray(z.sObject({ t: z.sUnion([z.sString(), z.sBoolean()]) })),
});
type Test = z.infer<typeof Test>;

test("object type inference", () => {
  type TestType = {
    f1: number;
    f2?: string | undefined;
    f3: string | null;
    f4: { t: string | boolean }[];
  };

  util.assertEqual<z.TypeOf<typeof Test>, TestType>(true);
});

test("unknown throw", () => {
  const asdf: unknown = 35;
  expect(() => Test.parse(asdf)).toThrow();
});

test("shape() should return schema of particular key", () => {
  const f1Schema = Test.shape.f1;
  const f2Schema = Test.shape.f2;
  const f3Schema = Test.shape.f3;
  const f4Schema = Test.shape.f4;

  expect(f1Schema).toBeInstanceOf(z.ZodNumber);
  expect(f2Schema).toBeInstanceOf(z.ZodOptional);
  expect(f3Schema).toBeInstanceOf(z.ZodNullable);
  expect(f4Schema).toBeInstanceOf(z.ZodArray);
});

test("correct parsing", () => {
  Test.parse({
    f1: 12,
    f2: "string",
    f3: "string",
    f4: [
      {
        t: "string",
      },
    ],
  });

  Test.parse({
    f1: 12,
    f3: null,
    f4: [
      {
        t: false,
      },
    ],
  });
});

test("incorrect #1", () => {
  expect(() => Test.parse({} as any)).toThrow();
});

test("nonstrict by default", () => {
  z.sObject({ points: z.sNumber() }).parse({
    points: 2314,
    unknown: "asdf",
  });
});

const data = {
  points: 2314,
  unknown: "asdf",
};

test("strip by default", () => {
  const val = z.sObject({ points: z.sNumber() }).parse(data);
  expect(val).toEqual({ points: 2314 });
});

test("unknownkeys override", () => {
  const val = z
    .sObject({ points: z.sNumber() })
    .strict()
    .passthrough()
    .strip()
    .nonstrict()
    .parse(data);

  expect(val).toEqual(data);
});

test("passthrough unknown", () => {
  const val = z.sObject({ points: z.sNumber() }).passthrough().parse(data);

  expect(val).toEqual(data);
});

test("strip unknown", () => {
  const val = z.sObject({ points: z.sNumber() }).strip().parse(data);

  expect(val).toEqual({ points: 2314 });
});

test("strict", () => {
  const val = z.sObject({ points: z.sNumber() }).strict().safeParse(data);

  expect(val.success).toEqual(false);
});

test("catchall inference", () => {
  const o1 = z
    .sObject({
      first: z.sString(),
    })
    .catchall(z.sNumber());

  const d1 = o1.parse({ first: "asdf", num: 1243 });
  util.assertEqual<number, (typeof d1)["asdf"]>(true);
  util.assertEqual<string, (typeof d1)["first"]>(true);
});

test("catchall overrides strict", () => {
  const o1 = z
    .sObject({ first: z.sString().optional() })
    .strict()
    .catchall(z.sNumber());

  // should run fine
  // setting a catchall overrides the unknownKeys behavior
  o1.parse({
    asdf: 1234,
  });

  // should only run catchall validation
  // against unknown keys
  o1.parse({
    first: "asdf",
    asdf: 1234,
  });
});

test("catchall overrides strict", () => {
  const o1 = z
    .sObject({
      first: z.sString(),
    })
    .strict()
    .catchall(z.sNumber());

  // should run fine
  // setting a catchall overrides the unknownKeys behavior
  o1.parse({
    first: "asdf",
    asdf: 1234,
  });
});

test("test that optional keys are unset", async () => {
  const SNamedEntity = z.sObject({
    id: z.sString(),
    set: z.sString().optional(),
    unset: z.sString().optional(),
  });
  const result = await SNamedEntity.parse({
    id: "asdf",
    set: undefined,
  });
  // eslint-disable-next-line ban/ban
  expect(Object.keys(result)).toEqual(["id", "set"]);
});

test("test catchall parsing", async () => {
  const result = z
    .sObject({ name: z.sString() })
    .catchall(z.sNumber())
    .parse({ name: "Foo", validExtraKey: 61 });

  expect(result).toEqual({ name: "Foo", validExtraKey: 61 });

  const result2 = z
    .sObject({ name: z.sString() })
    .catchall(z.sNumber())
    .safeParse({ name: "Foo", validExtraKey: 61, invalid: "asdf" });

  expect(result2.success).toEqual(false);
});

test("test nonexistent keys", async () => {
  const Schema = z.sUnion([
    z.sObject({ a: z.sString() }),
    z.sObject({ b: z.sNumber() }),
  ]);
  const obj = { a: "A" };
  const result = await Schema.spa(obj); // Works with 1.11.10, breaks with 2.0.0-beta.21
  expect(result.success).toBe(true);
});

test("test async union", async () => {
  const Schema2 = z.sUnion([
    z.sObject({
      ty: z.sString(),
    }),
    z.sObject({
      ty: z.sNumber(),
    }),
  ]);

  const obj = { ty: "A" };
  const result = await Schema2.spa(obj); // Works with 1.11.10, breaks with 2.0.0-beta.21
  expect(result.success).toEqual(true);
});

test("test inferred merged type", async () => {
  const asdf = z.sObject({ a: z.sString() }).merge(z.sObject({ a: z.sNumber() }));
  type asdf = z.infer<typeof asdf>;
  util.assertEqual<asdf, { a: number }>(true);
});

test("inferred merged object type with optional properties", async () => {
  const Merged = z
    .sObject({ a: z.sString(), b: z.sString().optional() })
    .merge(z.sObject({ a: z.sString().optional(), b: z.sString() }));
  type Merged = z.infer<typeof Merged>;
  util.assertEqual<Merged, { a?: string; b: string }>(true);
  // todo
  // util.assertEqual<Merged, { a?: string; b: string }>(true);
});

test("inferred unioned object type with optional properties", async () => {
  const Unioned = z.sUnion([
    z.sObject({ a: z.sString(), b: z.sString().optional() }),
    z.sObject({ a: z.sString().optional(), b: z.sString() }),
  ]);
  type Unioned = z.infer<typeof Unioned>;
  util.assertEqual<
    Unioned,
    { a: string; b?: string } | { a?: string; b: string }
  >(true);
});

test("inferred enum type", async () => {
  const Enum = z.sObject({ a: z.sString(), b: z.sString().optional() }).keyof();

  expect(Enum.Values).toEqual({
    a: "a",
    b: "b",
  });
  expect(Enum.enum).toEqual({
    a: "a",
    b: "b",
  });
  expect(Enum._def.values).toEqual(["a", "b"]);
  type Enum = z.infer<typeof Enum>;
  util.assertEqual<Enum, "a" | "b">(true);
});

test("inferred partial object type with optional properties", async () => {
  const Partial = z
    .sObject({ a: z.sString(), b: z.sString().optional() })
    .partial();
  type Partial = z.infer<typeof Partial>;
  util.assertEqual<Partial, { a?: string; b?: string }>(true);
});

test("inferred picked object type with optional properties", async () => {
  const Picked = z
    .sObject({ a: z.sString(), b: z.sString().optional() })
    .pick({ b: true });
  type Picked = z.infer<typeof Picked>;
  util.assertEqual<Picked, { b?: string }>(true);
});

test("inferred type for unknown/any keys", () => {
  const myType = z.sObject({
    anyOptional: z.any().optional(),
    anyRequired: z.any(),
    unknownOptional: z.unknown().optional(),
    unknownRequired: z.unknown(),
  });
  type myType = z.infer<typeof myType>;
  util.assertEqual<
    myType,
    {
      anyOptional?: any;
      anyRequired?: any;
      unknownOptional?: unknown;
      unknownRequired?: unknown;
    }
  >(true);
});

test("setKey", () => {
  const base = z.sObject({ name: z.sString() });
  const withNewKey = base.setKey("age", z.sNumber());

  type withNewKey = z.infer<typeof withNewKey>;
  util.assertEqual<withNewKey, { name: string; age: number }>(true);
  withNewKey.parse({ name: "asdf", age: 1234 });
});

test("strictcreate", async () => {
  const strictObj = z.strictObject({
    name: z.sString(),
  });

  const syncResult = strictObj.safeParse({ name: "asdf", unexpected: 13 });
  expect(syncResult.success).toEqual(false);

  const asyncResult = await strictObj.spa({ name: "asdf", unexpected: 13 });
  expect(asyncResult.success).toEqual(false);
});

test("object with refine", async () => {
  const schema = z
    .sObject({
      a: z.sString().default("foo"),
      b: z.sNumber(),
    })
    .refine(() => true);
  expect(schema.parse({ b: 5 })).toEqual({ b: 5, a: "foo" });
  const result = await schema.parseAsync({ b: 5 });
  expect(result).toEqual({ b: 5, a: "foo" });
});

test("intersection of object with date", async () => {
  const schema = z.sObject({
    a: z.date(),
  });
  expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
    a: new Date(1637353595983),
  });
  const result = await schema.parseAsync({ a: new Date(1637353595983) });
  expect(result).toEqual({ a: new Date(1637353595983) });
});

test("intersection of object with refine with date", async () => {
  const schema = z
    .sObject({
      a: z.date(),
    })
    .refine(() => true);
  expect(schema.and(schema).parse({ a: new Date(1637353595983) })).toEqual({
    a: new Date(1637353595983),
  });
  const result = await schema.parseAsync({ a: new Date(1637353595983) });
  expect(result).toEqual({ a: new Date(1637353595983) });
});

test("constructor key", () => {
  const person = z
    .sObject({
      name: z.sString(),
    })
    .strict();

  expect(() =>
    person.parse({
      name: "bob dylan",
      constructor: 61,
    })
  ).toThrow();
});

test("constructor key", () => {
  const Example = z.sObject({
    prop: z.sString(),
    opt: z.sNumber().optional(),
    arr: z.sString().sArray(),
  });

  type Example = z.infer<typeof Example>;
  util.assertEqual<keyof Example, "prop" | "opt" | "arr">(true);
});

test("unknownkeys merging", () => {
  // This one is "strict"
  const schemaA = z
    .sObject({
      a: z.sString(),
    })
    .strict();

  // This one is "strip"
  const schemaB = z
    .sObject({
      b: z.sString(),
    })
    .catchall(z.sString());

  const mergedSchema = schemaA.merge(schemaB);
  type mergedSchema = typeof mergedSchema;
  util.assertEqual<mergedSchema["_def"]["unknownKeys"], "strip">(true);
  expect(mergedSchema._def.unknownKeys).toEqual("strip");

  util.assertEqual<mergedSchema["_def"]["catchall"], z.ZodString>(true);
  expect(mergedSchema._def.catchall instanceof z.ZodString).toEqual(true);
});

const personToExtend = z.sObject({
  firstName: z.sString(),
  lastName: z.sString(),
});

test("extend() should return schema with new key", () => {
  const PersonWithNickname = personToExtend.extend({ nickName: z.sString() });
  type PersonWithNickname = z.infer<typeof PersonWithNickname>;

  const expected = { firstName: "f", nickName: "n", lastName: "l" };
  const actual = PersonWithNickname.parse(expected);

  expect(actual).toEqual(expected);
  util.assertEqual<
    keyof PersonWithNickname,
    "firstName" | "lastName" | "nickName"
  >(true);
  util.assertEqual<
    PersonWithNickname,
    { firstName: string; lastName: string; nickName: string }
  >(true);
});

test("extend() should have power to override existing key", () => {
  const PersonWithNumberAsLastName = personToExtend.extend({
    lastName: z.sNumber(),
  });
  type PersonWithNumberAsLastName = z.infer<typeof PersonWithNumberAsLastName>;

  const expected = { firstName: "f", lastName: 42 };
  const actual = PersonWithNumberAsLastName.parse(expected);

  expect(actual).toEqual(expected);
  util.assertEqual<
    PersonWithNumberAsLastName,
    { firstName: string; lastName: number }
  >(true);
});

test("passthrough index signature", () => {
  const a = z.sObject({ a: z.sString() });
  type a = z.infer<typeof a>;
  util.assertEqual<{ a: string }, a>(true);
  const b = a.passthrough();
  type b = z.infer<typeof b>;
  util.assertEqual<{ a: string } & { [k: string]: unknown }, b>(true);
});

test("xor", () => {
  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  type A = { name: string; a: number };
  type B = { name: string; b: number };
  type C = XOR<A, B>;
  type Outer = { data: C };
  const Outer: z.ZodType<Outer> = z.sObject({
    data: z.sUnion([
      z.sObject({ name: z.sString(), a: z.sNumber() }),
      z.sObject({ name: z.sString(), b: z.sNumber() }),
    ]),
  });
});
