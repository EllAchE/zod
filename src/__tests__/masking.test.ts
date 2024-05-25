// @ts-ignore TS6133
import { test } from "@jest/globals";

import * as z from "../index";

test("masking test", () => {});

test("require", () => {
  const baseSchema = z.sObject({
    firstName: z.sString(),
    middleName: z.sString().optional(),
    lastName: z.sUnion([z.undefined(), z.sString()]),
    otherName: z.sUnion([z.sString(), z.undefined(), z.sString()]),
  });
  baseSchema;
  // const reqBase = baseSchema.require();
  // const ewr = reqBase.shape;
  // expect(ewr.firstName).toBeInstanceOf(z.ZodString);
  // expect(ewr.middleName).toBeInstanceOf(z.ZodString);
  // expect(ewr.lastName).toBeInstanceOf(z.ZodString);
  // expect(ewr.otherName).toBeInstanceOf(z.ZodUnion);
});
