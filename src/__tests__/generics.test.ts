// @ts-ignore TS6133
import { test } from "@jest/globals";

import { util } from "../helpers";
import * as z from "../index";

test("generics", () => {
  async function stripOuter<TData extends z.ZodTypeAny>(
    schema: TData,
    data: unknown
  ) {
    return z
      .sObject({
        nested: schema, // as z.ZodTypeAny,
      })
      .transform((data) => {
        return data.nested!;
      })
      .parse({ nested: data });
  }

  const result = stripOuter(z.sObject({ a: z.sString() }), { a: "asdf" });
  util.assertEqual<typeof result, Promise<{ a: string }>>(true);
});

// test("assignability", () => {
//   const createSchemaAndParse = <K extends string, VS extends z.ZodString>(
//     key: K,
//     valueSchema: VS,
//     data: unknown
//   ) => {
//     const schema = z.sObject({
//       [key]: valueSchema,
//     } as { [k in K]: VS });
//     return { [key]: valueSchema };
//     const parsed = schema.parse(data);
//     return parsed;
//     // const inferred: z.infer<z.ZodObject<{ [k in K]: VS }>> = parsed;
//     // return inferred;
//   };
//   const parsed = createSchemaAndParse("foo", z.sString(), { foo: "" });
//   util.assertEqual<typeof parsed, { foo: string }>(true);
// });

test("nested no undefined", () => {
  const inner = z.sString().or(z.sArray(z.sString()));
  const outer = z.sObject({ inner });
  type outerSchema = z.infer<typeof outer>;
  z.util.assertEqual<outerSchema, { inner: string | string[] }>(true);
  expect(outer.safeParse({ inner: undefined }).success).toEqual(false);
});
