// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const gtFive = z.sNumber().gt(5);
const gteFive = z.sNumber().gte(5);
const minFive = z.sNumber().min(5);
const ltFive = z.sNumber().lt(5);
const lteFive = z.sNumber().lte(5);
const maxFive = z.sNumber().max(5);
const intNum = z.sNumber().int();
const positive = z.sNumber().positive();
const negative = z.sNumber().negative();
const nonpositive = z.sNumber().nonpositive();
const nonnegative = z.sNumber().nonnegative();
const multipleOfFive = z.sNumber().multipleOf(5);
const multipleOfNegativeFive = z.sNumber().multipleOf(-5);
const finite = z.sNumber().finite();
const safe = z.sNumber().safe();
const stepPointOne = z.sNumber().step(0.1);
const stepPointZeroZeroZeroOne = z.sNumber().step(0.0001);
const stepSixPointFour = z.sNumber().step(6.4);

test("passing validations", () => {
  z.sNumber().parse(1);
  z.sNumber().parse(1.5);
  z.sNumber().parse(0);
  z.sNumber().parse(-1.5);
  z.sNumber().parse(-1);
  z.sNumber().parse(Infinity);
  z.sNumber().parse(-Infinity);
  gtFive.parse(6);
  gtFive.parse(Infinity);
  gteFive.parse(5);
  gteFive.parse(Infinity);
  minFive.parse(5);
  minFive.parse(Infinity);
  ltFive.parse(4);
  ltFive.parse(-Infinity);
  lteFive.parse(5);
  lteFive.parse(-Infinity);
  maxFive.parse(5);
  maxFive.parse(-Infinity);
  intNum.parse(4);
  positive.parse(1);
  positive.parse(Infinity);
  negative.parse(-1);
  negative.parse(-Infinity);
  nonpositive.parse(0);
  nonpositive.parse(-1);
  nonpositive.parse(-Infinity);
  nonnegative.parse(0);
  nonnegative.parse(1);
  nonnegative.parse(Infinity);
  multipleOfFive.parse(15);
  multipleOfFive.parse(-15);
  multipleOfNegativeFive.parse(-15);
  multipleOfNegativeFive.parse(15);
  finite.parse(123);
  safe.parse(Number.MIN_SAFE_INTEGER);
  safe.parse(Number.MAX_SAFE_INTEGER);
  stepPointOne.parse(6);
  stepPointOne.parse(6.1);
  stepPointOne.parse(6.1);
  stepSixPointFour.parse(12.8);
  stepPointZeroZeroZeroOne.parse(3.01);
});

test("failing validations", () => {
  expect(() => ltFive.parse(5)).toThrow();
  expect(() => lteFive.parse(6)).toThrow();
  expect(() => maxFive.parse(6)).toThrow();
  expect(() => gtFive.parse(5)).toThrow();
  expect(() => gteFive.parse(4)).toThrow();
  expect(() => minFive.parse(4)).toThrow();
  expect(() => intNum.parse(3.14)).toThrow();
  expect(() => positive.parse(0)).toThrow();
  expect(() => positive.parse(-1)).toThrow();
  expect(() => negative.parse(0)).toThrow();
  expect(() => negative.parse(1)).toThrow();
  expect(() => nonpositive.parse(1)).toThrow();
  expect(() => nonnegative.parse(-1)).toThrow();
  expect(() => multipleOfFive.parse(7.5)).toThrow();
  expect(() => multipleOfFive.parse(-7.5)).toThrow();
  expect(() => multipleOfNegativeFive.parse(-7.5)).toThrow();
  expect(() => multipleOfNegativeFive.parse(7.5)).toThrow();
  expect(() => finite.parse(Infinity)).toThrow();
  expect(() => finite.parse(-Infinity)).toThrow();
  expect(() => safe.parse(Number.MIN_SAFE_INTEGER - 1)).toThrow();
  expect(() => safe.parse(Number.MAX_SAFE_INTEGER + 1)).toThrow();

  expect(() => stepPointOne.parse(6.11)).toThrow();
  expect(() => stepPointOne.parse(6.1000000001)).toThrow();
  expect(() => stepSixPointFour.parse(6.41)).toThrow();
});

test("parse NaN", () => {
  expect(() => z.sNumber().parse(NaN)).toThrow();
});

test("min max getters", () => {
  expect(z.sNumber().minValue).toBeNull;
  expect(ltFive.minValue).toBeNull;
  expect(lteFive.minValue).toBeNull;
  expect(maxFive.minValue).toBeNull;
  expect(negative.minValue).toBeNull;
  expect(nonpositive.minValue).toBeNull;
  expect(intNum.minValue).toBeNull;
  expect(multipleOfFive.minValue).toBeNull;
  expect(finite.minValue).toBeNull;
  expect(gtFive.minValue).toEqual(5);
  expect(gteFive.minValue).toEqual(5);
  expect(minFive.minValue).toEqual(5);
  expect(minFive.min(10).minValue).toEqual(10);
  expect(positive.minValue).toEqual(0);
  expect(nonnegative.minValue).toEqual(0);
  expect(safe.minValue).toEqual(Number.MIN_SAFE_INTEGER);

  expect(z.sNumber().maxValue).toBeNull;
  expect(gtFive.maxValue).toBeNull;
  expect(gteFive.maxValue).toBeNull;
  expect(minFive.maxValue).toBeNull;
  expect(positive.maxValue).toBeNull;
  expect(nonnegative.maxValue).toBeNull;
  expect(intNum.minValue).toBeNull;
  expect(multipleOfFive.minValue).toBeNull;
  expect(finite.minValue).toBeNull;
  expect(ltFive.maxValue).toEqual(5);
  expect(lteFive.maxValue).toEqual(5);
  expect(maxFive.maxValue).toEqual(5);
  expect(maxFive.max(1).maxValue).toEqual(1);
  expect(negative.maxValue).toEqual(0);
  expect(nonpositive.maxValue).toEqual(0);
  expect(safe.maxValue).toEqual(Number.MAX_SAFE_INTEGER);
});

test("int getter", () => {
  expect(z.sNumber().isInt).toEqual(false);
  expect(z.sNumber().multipleOf(1.5).isInt).toEqual(false);
  expect(gtFive.isInt).toEqual(false);
  expect(gteFive.isInt).toEqual(false);
  expect(minFive.isInt).toEqual(false);
  expect(positive.isInt).toEqual(false);
  expect(nonnegative.isInt).toEqual(false);
  expect(finite.isInt).toEqual(false);
  expect(ltFive.isInt).toEqual(false);
  expect(lteFive.isInt).toEqual(false);
  expect(maxFive.isInt).toEqual(false);
  expect(negative.isInt).toEqual(false);
  expect(nonpositive.isInt).toEqual(false);
  expect(safe.isInt).toEqual(false);

  expect(intNum.isInt).toEqual(true);
  expect(multipleOfFive.isInt).toEqual(true);
});

test("finite getter", () => {
  expect(z.sNumber().isFinite).toEqual(false);
  expect(gtFive.isFinite).toEqual(false);
  expect(gteFive.isFinite).toEqual(false);
  expect(minFive.isFinite).toEqual(false);
  expect(positive.isFinite).toEqual(false);
  expect(nonnegative.isFinite).toEqual(false);
  expect(ltFive.isFinite).toEqual(false);
  expect(lteFive.isFinite).toEqual(false);
  expect(maxFive.isFinite).toEqual(false);
  expect(negative.isFinite).toEqual(false);
  expect(nonpositive.isFinite).toEqual(false);

  expect(finite.isFinite).toEqual(true);
  expect(intNum.isFinite).toEqual(true);
  expect(multipleOfFive.isFinite).toEqual(true);
  expect(z.sNumber().min(5).max(10).isFinite).toEqual(true);
  expect(safe.isFinite).toEqual(true);
});
