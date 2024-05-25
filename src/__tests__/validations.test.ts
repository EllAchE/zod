// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("array min", async () => {
  try {
    await z.sArray(z.sString()).min(4).parseAsync([]);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Array must contain at least 4 element(s)"
    );
  }
});

test("array max", async () => {
  try {
    await z.sArray(z.sString()).max(2).parseAsync(["asdf", "asdf", "asdf"]);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Array must contain at most 2 element(s)"
    );
  }
});

test("array length", async () => {
  try {
    await z.sArray(z.sString()).length(2).parseAsync(["asdf", "asdf", "asdf"]);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Array must contain exactly 2 element(s)"
    );
  }

  try {
    await z.sArray(z.sString()).length(2).parseAsync(["asdf"]);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Array must contain exactly 2 element(s)"
    );
  }
});

test("string length", async () => {
  try {
    await z.sString().length(4).parseAsync("asd");
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "String must contain exactly 4 character(s)"
    );
  }

  try {
    await z.sString().length(4).parseAsync("asdaa");
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "String must contain exactly 4 character(s)"
    );
  }
});

test("string min", async () => {
  try {
    await z.sString().min(4).parseAsync("asd");
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "String must contain at least 4 character(s)"
    );
  }
});

test("string max", async () => {
  try {
    await z.sString().max(4).parseAsync("aasdfsdfsd");
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "String must contain at most 4 character(s)"
    );
  }
});

test("number min", async () => {
  try {
    await z.sNumber().gte(3).parseAsync(2);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be greater than or equal to 3"
    );
  }
});

test("number max", async () => {
  try {
    await z.sNumber().lte(3).parseAsync(4);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be less than or equal to 3"
    );
  }
});

test("number nonnegative", async () => {
  try {
    await z.sNumber().nonnegative().parseAsync(-1);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be greater than or equal to 0"
    );
  }
});

test("number nonpositive", async () => {
  try {
    await z.sNumber().nonpositive().parseAsync(1);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be less than or equal to 0"
    );
  }
});

test("number negative", async () => {
  try {
    await z.sNumber().negative().parseAsync(1);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be less than 0"
    );
  }
});

test("number positive", async () => {
  try {
    await z.sNumber().positive().parseAsync(-1);
  } catch (err) {
    expect((err as z.ZodError).issues[0].message).toEqual(
      "Number must be greater than 0"
    );
  }
});

test("instantiation", () => {
  z.sString().min(5);
  z.sString().max(5);
  z.sString().length(5);
  z.sString().email();
  z.sString().url();
  z.sString().uuid();
  z.sString().min(5, { message: "Must be 5 or more characters long" });
  z.sString().max(5, { message: "Must be 5 or fewer characters long" });
  z.sString().length(5, { message: "Must be exactly 5 characters long" });
  z.sString().email({ message: "Invalid email address." });
  z.sString().url({ message: "Invalid url" });
  z.sString().uuid({ message: "Invalid UUID" });
});

test("int", async () => {
  const int = z.sNumber().int();
  int.parse(4);
  expect(() => int.parse(3.5)).toThrow();
});
