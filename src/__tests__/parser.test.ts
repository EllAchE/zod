// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("parse strict object with unknown keys", () => {
  expect(() =>
    z
      .sObject({ name: z.sString() })
      .strict()
      .parse({ name: "bill", unknownKey: 12 } as any)
  ).toThrow();
});

test("parse nonstrict object with unknown keys", () => {
  z.sObject({ name: z.sString() })
    .nonstrict()
    .parse({ name: "bill", unknownKey: 12 });
});

test("invalid left side of intersection", () => {
  expect(() =>
    z.intersection(z.sString(), z.sNumber()).parse(12 as any)
  ).toThrow();
});

test("invalid right side of intersection", () => {
  expect(() =>
    z.intersection(z.sString(), z.sNumber()).parse("12" as any)
  ).toThrow();
});

test("parsing non-array in tuple schema", () => {
  expect(() => z.tuple([]).parse("12" as any)).toThrow();
});

test("incorrect num elements in tuple", () => {
  expect(() => z.tuple([]).parse(["asdf"] as any)).toThrow();
});

test("invalid enum value", () => {
  expect(() => z.enum(["Blue"]).parse("Red" as any)).toThrow();
});

test("parsing unknown", () => {
  z.sString().parse("Red" as unknown);
});
