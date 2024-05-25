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
    a.optional().parse(bad);
  } catch (error) {
    expect((error as z.ZodError).formErrors).toEqual(expected);
  }
}

test("Should have error messages appropriate for the underlying type", () => {
  checkErrors(z.sString().min(2), 1);
  z.sString().min(2).optional().parse(undefined);
  checkErrors(z.sNumber().gte(2), 1);
  z.sNumber().gte(2).optional().parse(undefined);
  checkErrors(z.boolean(), "");
  z.boolean().optional().parse(undefined);
  checkErrors(z.undefined(), null);
  z.undefined().optional().parse(undefined);
  checkErrors(z.null(), {});
  z.null().optional().parse(undefined);
  checkErrors(z.sObject({}), 1);
  z.sObject({}).optional().parse(undefined);
  checkErrors(z.tuple([]), 1);
  z.tuple([]).optional().parse(undefined);
  checkErrors(z.unknown(), 1);
  z.unknown().optional().parse(undefined);
});

test("unwrap", () => {
  const unwrapped = z.sString().optional().unwrap();
  expect(unwrapped).toBeInstanceOf(z.ZodString);
});
