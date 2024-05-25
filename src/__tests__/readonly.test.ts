// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import { util } from "../helpers";
import * as z from "../index";

enum testEnum {
  A,
  B,
}

const schemas = [
  z.sString().readonly(),
  z.sNumber().readonly(),
  z.nan().readonly(),
  z.bigint().readonly(),
  z.boolean().readonly(),
  z.date().readonly(),
  z.undefined().readonly(),
  z.null().readonly(),
  z.any().readonly(),
  z.unknown().readonly(),
  z.void().readonly(),
  z.function().args(z.sString(), z.sNumber()).readonly(),

  z.sArray(z.sString()).readonly(),
  z.tuple([z.sString(), z.sNumber()]).readonly(),
  z.map(z.sString(), z.date()).readonly(),
  z.set(z.promise(z.sString())).readonly(),
  z.record(z.sString()).readonly(),
  z.record(z.sString(), z.sNumber()).readonly(),
  z.sObject({ a: z.sString(), 1: z.sNumber() }).readonly(),
  z.nativeEnum(testEnum).readonly(),
  z.promise(z.sString()).readonly(),
] as const;

test("flat inference", () => {
  util.assertEqual<z.infer<(typeof schemas)[0]>, string>(true);
  util.assertEqual<z.infer<(typeof schemas)[1]>, number>(true);
  util.assertEqual<z.infer<(typeof schemas)[2]>, number>(true);
  util.assertEqual<z.infer<(typeof schemas)[3]>, bigint>(true);
  util.assertEqual<z.infer<(typeof schemas)[4]>, boolean>(true);
  util.assertEqual<z.infer<(typeof schemas)[5]>, Date>(true);
  util.assertEqual<z.infer<(typeof schemas)[6]>, undefined>(true);
  util.assertEqual<z.infer<(typeof schemas)[7]>, null>(true);
  util.assertEqual<z.infer<(typeof schemas)[8]>, any>(true);
  util.assertEqual<z.infer<(typeof schemas)[9]>, Readonly<unknown>>(true);
  util.assertEqual<z.infer<(typeof schemas)[10]>, void>(true);
  util.assertEqual<
    z.infer<(typeof schemas)[11]>,
    (args_0: string, args_1: number, ...args_2: unknown[]) => unknown
  >(true);
  util.assertEqual<z.infer<(typeof schemas)[12]>, readonly string[]>(true);

  util.assertEqual<z.infer<(typeof schemas)[13]>, readonly [string, number]>(
    true
  );
  util.assertEqual<z.infer<(typeof schemas)[14]>, ReadonlyMap<string, Date>>(
    true
  );
  util.assertEqual<z.infer<(typeof schemas)[15]>, ReadonlySet<Promise<string>>>(
    true
  );
  util.assertEqual<
    z.infer<(typeof schemas)[16]>,
    Readonly<Record<string, string>>
  >(true);
  util.assertEqual<
    z.infer<(typeof schemas)[17]>,
    Readonly<Record<string, number>>
  >(true);
  util.assertEqual<
    z.infer<(typeof schemas)[18]>,
    { readonly a: string; readonly 1: number }
  >(true);
  util.assertEqual<z.infer<(typeof schemas)[19]>, Readonly<testEnum>>(true);
  util.assertEqual<z.infer<(typeof schemas)[20]>, Promise<string>>(true);
});

// test("deep inference", () => {
//   util.assertEqual<z.infer<(typeof deepReadonlySchemas_0)[0]>, string>(true);
//   util.assertEqual<z.infer<(typeof deepReadonlySchemas_0)[1]>, number>(true);
//   util.assertEqual<z.infer<(typeof deepReadonlySchemas_0)[2]>, number>(true);
//   util.assertEqual<z.infer<(typeof deepReadonlySchemas_0)[3]>, bigint>(true);
//   util.assertEqual<z.infer<(typeof deepReadonlySchemas_0)[4]>, boolean>(true);
//   util.assertEqual<z.infer<(typeof deepReadonlySchemas_0)[5]>, Date>(true);
//   util.assertEqual<z.infer<(typeof deepReadonlySchemas_0)[6]>, undefined>(true);
//   util.assertEqual<z.infer<(typeof deepReadonlySchemas_0)[7]>, null>(true);
//   util.assertEqual<z.infer<(typeof deepReadonlySchemas_0)[8]>, any>(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[9]>,
//     Readonly<unknown>
//   >(true);
//   util.assertEqual<z.infer<(typeof deepReadonlySchemas_0)[10]>, void>(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[11]>,
//     (args_0: string, args_1: number, ...args_2: unknown[]) => unknown
//   >(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[12]>,
//     readonly string[]
//   >(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[13]>,
//     readonly [string, number]
//   >(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[14]>,
//     ReadonlyMap<string, Date>
//   >(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[15]>,
//     ReadonlySet<Promise<string>>
//   >(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[16]>,
//     Readonly<Record<string, string>>
//   >(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[17]>,
//     Readonly<Record<string, number>>
//   >(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[18]>,
//     { readonly a: string; readonly 1: number }
//   >(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[19]>,
//     Readonly<testEnum>
//   >(true);
//   util.assertEqual<
//     z.infer<(typeof deepReadonlySchemas_0)[20]>,
//     Promise<string>
//   >(true);

//   util.assertEqual<
//     z.infer<typeof crazyDeepReadonlySchema>,
//     ReadonlyMap<
//       ReadonlySet<readonly [string, number]>,
//       {
//         readonly a: {
//           readonly [x: string]: readonly any[];
//         };
//         readonly b: {
//           readonly c: {
//             readonly d: {
//               readonly e: {
//                 readonly f: {
//                   readonly g?: {};
//                 };
//               };
//             };
//           };
//         };
//       }
//     >
//   >(true);
// });

test("object freezing", () => {
  expect(Object.isFrozen(z.sArray(z.sString()).readonly().parse(["a"]))).toBe(
    true
  );
  expect(
    Object.isFrozen(
      z.tuple([z.sString(), z.sNumber()]).readonly().parse(["a", 1])
    )
  ).toBe(true);
  expect(
    Object.isFrozen(
      z
        .map(z.sString(), z.date())
        .readonly()
        .parse(new Map([["a", new Date()]]))
    )
  ).toBe(true);
  expect(
    Object.isFrozen(
      z
        .set(z.promise(z.sString()))
        .readonly()
        .parse(new Set([Promise.resolve("a")]))
    )
  ).toBe(true);
  expect(
    Object.isFrozen(z.record(z.sString()).readonly().parse({ a: "b" }))
  ).toBe(true);
  expect(
    Object.isFrozen(z.record(z.sString(), z.sNumber()).readonly().parse({ a: 1 }))
  ).toBe(true);
  expect(
    Object.isFrozen(
      z
        .sObject({ a: z.sString(), 1: z.sNumber() })
        .readonly()
        .parse({ a: "b", 1: 2 })
    )
  ).toBe(true);
  expect(
    Object.isFrozen(
      z.promise(z.sString()).readonly().parse(Promise.resolve("a"))
    )
  ).toBe(true);
});

test("async object freezing", async () => {
  expect(
    Object.isFrozen(await z.sArray(z.sString()).readonly().parseAsync(["a"]))
  ).toBe(true);
  expect(
    Object.isFrozen(
      await z.tuple([z.sString(), z.sNumber()]).readonly().parseAsync(["a", 1])
    )
  ).toBe(true);
  expect(
    Object.isFrozen(
      await z
        .map(z.sString(), z.date())
        .readonly()
        .parseAsync(new Map([["a", new Date()]]))
    )
  ).toBe(true);
  expect(
    Object.isFrozen(
      await z
        .set(z.promise(z.sString()))
        .readonly()
        .parseAsync(new Set([Promise.resolve("a")]))
    )
  ).toBe(true);
  expect(
    Object.isFrozen(
      await z.record(z.sString()).readonly().parseAsync({ a: "b" })
    )
  ).toBe(true);
  expect(
    Object.isFrozen(
      await z.record(z.sString(), z.sNumber()).readonly().parseAsync({ a: 1 })
    )
  ).toBe(true);
  expect(
    Object.isFrozen(
      await z
        .sObject({ a: z.sString(), 1: z.sNumber() })
        .readonly()
        .parseAsync({ a: "b", 1: 2 })
    )
  ).toBe(true);
  expect(
    Object.isFrozen(
      await z.promise(z.sString()).readonly().parseAsync(Promise.resolve("a"))
    )
  ).toBe(true);
});
