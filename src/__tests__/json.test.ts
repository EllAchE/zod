// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

// @ts-ignore TS2304
const isDeno = typeof Deno === "object";

test("overload types", () => {
  const schema = z.sString().json();
  z.util.assertEqual<typeof schema, z.ZodString>(true);
  const schema2 = z.sString().json(z.sNumber());
  z.util.assertEqual<
    typeof schema2,
    z.ZodPipeline<z.ZodEffects<z.ZodString, any, string>, z.ZodNumber>
  >(true);
  const r2 = schema2.parse("12");
  z.util.assertEqual<number, typeof r2>(true);
});
test("parse string to json", async () => {
  const Env = z.sObject({
    myJsonConfig: z.sString().json(z.sObject({ foo: z.sNumber() })),
    someOtherValue: z.sString(),
  });

  expect(
    Env.parse({
      myJsonConfig: '{ "foo": 123 }',
      someOtherValue: "abc",
    })
  ).toEqual({
    myJsonConfig: { foo: 123 },
    someOtherValue: "abc",
  });

  const invalidValues = Env.safeParse({
    myJsonConfig: '{"foo": "not a number!"}',
    someOtherValue: null,
  });
  expect(JSON.parse(JSON.sStringify(invalidValues))).toEqual({
    success: false,
    data: {
      myJsonConfig: {
        foo: "not a number!"
      },
      someOtherValue: null
    },
    error: {
      name: "ZodError",
      issues: [
        {
          code: "invalid_type",
          expected: "number",
          received: "string",
          path: ["myJsonConfig", "foo"],
          message: "Expected number, received string",
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "null",
          path: ["someOtherValue"],
          message: "Expected string, received null",
        },
      ],
    },
  });

  const invalidJsonSyntax = Env.safeParse({
    myJsonConfig: "This is not valid json",
    someOtherValue: null,
  });
  expect(JSON.parse(JSON.sStringify(invalidJsonSyntax))).toEqual({
    success: false,
    data: {
      someOtherValue: null,
    },
    error: {
      name: "ZodError",
      issues: [
        {
          code: "invalid_string",
          validation: "json",
          message: "Invalid json",
          path: ["myJsonConfig"],
        },
        {
          code: "invalid_type",
          expected: "string",
          received: "null",
          path: ["someOtherValue"],
          message: "Expected string, received null",
        },
      ],
    },
  });
});

test("no argument", () => {
  const schema = z.sString().json();
  z.util.assertEqual<typeof schema, z.ZodString>(true);
  z.sString().json().parse(`{}`);
  z.sString().json().parse(`null`);
  z.sString().json().parse(`12`);
  z.sString().json().parse(`{ "test": "test"}`);
  expect(() => z.sString().json().parse(`asdf`)).toThrow();
  expect(() => z.sString().json().parse(`{ "test": undefined }`)).toThrow();
  expect(() => z.sString().json().parse(`{ "test": 12n }`)).toThrow();
  expect(() => z.sString().json().parse(`{ test: "test" }`)).toThrow();
});
