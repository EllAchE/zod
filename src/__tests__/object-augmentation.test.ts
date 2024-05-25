// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("object augmentation", () => {
  const Animal = z
    .sObject({
      species: z.sString(),
    })
    .augment({
      population: z.sNumber(),
    });
  // overwrites `species`
  const ModifiedAnimal = Animal.augment({
    species: z.sArray(z.sString()),
  });
  ModifiedAnimal.parse({
    species: ["asd"],
    population: 1324,
  });

  const bad = () =>
    ModifiedAnimal.parse({
      species: "asdf",
      population: 1324,
    } as any);
  expect(bad).toThrow();
});
