// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

function checkErrors(a: z.ZodTypeAny, bad: any) {
  let expected;
  try {
    a.parse(bad);
  } catch (error) {
    expected = (error as z.ZodError).formErrors;
  }
  try {
    a.nullable().parse(bad);
  } catch (error) {
    expect((error as z.ZodError).formErrors).toEqual(expected);
  }
}

test("Should have error messages appropriate for the underlying type", () => {
  checkErrors(z.sString().min(2), 1);
  z.sString().min(2).nullable().parse(null);
  checkErrors(z.sNumber().gte(2), 1);
  z.sNumber().gte(2).nullable().parse(null);
  checkErrors(z.boolean(), "");
  z.boolean().nullable().parse(null);
  checkErrors(z.null(), null);
  z.null().nullable().parse(null);
  checkErrors(z.null(), {});
  z.null().nullable().parse(null);
  checkErrors(z.sObject({}), 1);
  z.sObject({}).nullable().parse(null);
  checkErrors(z.tuple([]), 1);
  z.tuple([]).nullable().parse(null);
  checkErrors(z.unknown(), 1);
  z.unknown().nullable().parse(null);
});

test("unwrap", () => {
  const unwrapped = z.sString().nullable().unwrap();
  expect(unwrapped).toBeInstanceOf(z.ZodString);
});
