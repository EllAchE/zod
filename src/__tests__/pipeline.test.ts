// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("string to number pipeline", () => {
  const schema = z.sString().transform(Number).pipe(z.sNumber());
  expect(schema.parse("1234")).toEqual(1234);
});

test("string to number pipeline async", async () => {
  const schema = z
    .sString()
    .transform(async (val) => Number(val))
    .pipe(z.sNumber());
  expect(await schema.parseAsync("1234")).toEqual(1234);
});

test("break if dirty", () => {
  const schema = z
    .sString()
    .refine((c) => c === "1234")
    .transform(async (val) => Number(val))
    .pipe(z.sNumber().refine((v) => v < 100));
  const r1: any = schema.safeParse("12345");
  expect(r1.error.issues.length).toBe(1);
  const r2: any = schema.safeParse("3");
  expect(r2.error.issues.length).toBe(1);
});
