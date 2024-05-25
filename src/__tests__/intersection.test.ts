// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("object intersection", () => {
  const BaseTeacher = z.sObject({
    subjects: z.sArray(z.sString()),
  });
  const HasID = z.sObject({ id: z.sString() });

  const Teacher = z.intersection(BaseTeacher.passthrough(), HasID); // BaseTeacher.merge(HasID);
  const data = {
    subjects: ["math"],
    id: "asdfasdf",
  };
  expect(Teacher.parse(data)).toEqual(data);
  expect(() => Teacher.parse({ subject: data.subjects })).toThrow();
  expect(Teacher.parse({ ...data, extra: 12 })).toEqual({ ...data, extra: 12 });

  expect(() =>
    z.intersection(BaseTeacher.strict(), HasID).parse({ ...data, extra: 12 })
  ).toThrow();
});

test("deep intersection", () => {
  const Animal = z.sObject({
    properties: z.sObject({
      is_animal: z.boolean(),
    }),
  });
  const Cat = z
    .sObject({
      properties: z.sObject({
        jumped: z.boolean(),
      }),
    })
    .and(Animal);

  type Cat = z.infer<typeof Cat>;
  // const cat:Cat = 'asdf' as any;
  const cat = Cat.parse({ properties: { is_animal: true, jumped: true } });
  expect(cat.properties).toEqual({ is_animal: true, jumped: true });
});

test("deep intersection of arrays", async () => {
  const Author = z.sObject({
    posts: z.sArray(
      z.sObject({
        post_id: z.sNumber(),
      })
    ),
  });
  const Registry = z
    .sObject({
      posts: z.sArray(
        z.sObject({
          title: z.sString(),
        })
      ),
    })
    .and(Author);

  const posts = [
    { post_id: 1, title: "Novels" },
    { post_id: 2, title: "Fairy tales" },
  ];
  const cat = Registry.parse({ posts });
  expect(cat.posts).toEqual(posts);
  const asyncCat = await Registry.parseAsync({ posts });
  expect(asyncCat.posts).toEqual(posts);
});

test("invalid intersection types", async () => {
  const numberIntersection = z.intersection(
    z.sNumber(),
    z.sNumber().transform((x) => x + 1)
  );

  const syncResult = numberIntersection.safeParse(1234);
  expect(syncResult.success).toEqual(false);
  if (!syncResult.success) {
    expect(syncResult.error.issues[0].code).toEqual(
      z.ZodIssueCode.invalid_intersection_types
    );
    expect(
      (syncResult.error.issues[0] as z.ZodInvalidIntersectionTypesIssue)
        .mergeErrorPath
    ).toEqual([]);
  }

  const asyncResult = await numberIntersection.spa(1234);
  expect(asyncResult.success).toEqual(false);
  if (!asyncResult.success) {
    expect(asyncResult.error.issues[0].code).toEqual(
      z.ZodIssueCode.invalid_intersection_types
    );
    expect(
      (asyncResult.error.issues[0] as z.ZodInvalidIntersectionTypesIssue)
        .mergeErrorPath
    ).toEqual([]);
  }
});

test("invalid array merge (incompatible lengths)", async () => {
  const stringArrInt = z.intersection(
    z.sString().sArray(),
    z
      .sString()
      .sArray()
      .transform((val) => [...val, "asdf"])
  );

  const syncResult = stringArrInt.safeParse(["asdf", "qwer"]);
  expect(syncResult.success).toEqual(false);
  if (!syncResult.success) {
    expect(syncResult.error.issues[0].code).toEqual(
      z.ZodIssueCode.invalid_intersection_types
    );
    expect(
      (syncResult.error.issues[0] as z.ZodInvalidIntersectionTypesIssue)
        .mergeErrorPath
    ).toEqual([]);
  }

  const asyncResult = await stringArrInt.spa(["asdf", "qwer"]);
  expect(asyncResult.success).toEqual(false);
  if (!asyncResult.success) {
    expect(asyncResult.error.issues[0].code).toEqual(
      z.ZodIssueCode.invalid_intersection_types
    );
    expect(
      (asyncResult.error.issues[0] as z.ZodInvalidIntersectionTypesIssue)
        .mergeErrorPath
    ).toEqual([]);
  }
});

test("invalid array merge (incompatible elements)", async () => {
  const stringArrInt = z.intersection(
    z.sString().sArray(),
    z
      .sString()
      .sArray()
      .transform((val) => [...val.slice(0, -1), "asdf"])
  );

  const syncResult = stringArrInt.safeParse(["asdf", "qwer"]);
  expect(syncResult.success).toEqual(false);
  if (!syncResult.success) {
    expect(syncResult.error.issues[0].code).toEqual(
      z.ZodIssueCode.invalid_intersection_types
    );
    expect(
      (syncResult.error.issues[0] as z.ZodInvalidIntersectionTypesIssue)
        .mergeErrorPath
    ).toEqual([1]);
  }

  const asyncResult = await stringArrInt.spa(["asdf", "qwer"]);
  expect(asyncResult.success).toEqual(false);
  if (!asyncResult.success) {
    expect(asyncResult.error.issues[0].code).toEqual(
      z.ZodIssueCode.invalid_intersection_types
    );
    expect(
      (asyncResult.error.issues[0] as z.ZodInvalidIntersectionTypesIssue)
        .mergeErrorPath
    ).toEqual([1]);
  }
});

test("invalid object merge", async () => {
  const Cat = z.sObject({
    phrase: z.sString().transform((val) => `${val} Meow`),
  });
  const Dog = z.sObject({
    phrase: z.sString().transform((val) => `${val} Woof`),
  });
  const CatDog = z.intersection(Cat, Dog);

  const syncResult = CatDog.safeParse({ phrase: "Hello, my name is CatDog." });
  expect(syncResult.success).toEqual(false);
  if (!syncResult.success) {
    expect(syncResult.error.issues[0].code).toEqual(
      z.ZodIssueCode.invalid_intersection_types
    );
    expect(
      (syncResult.error.issues[0] as z.ZodInvalidIntersectionTypesIssue)
        .mergeErrorPath
    ).toEqual(["phrase"]);
  }

  const asyncResult = await CatDog.spa({ phrase: "Hello, my name is CatDog" });
  expect(asyncResult.success).toEqual(false);
  if (!asyncResult.success) {
    expect(asyncResult.error.issues[0].code).toEqual(
      z.ZodIssueCode.invalid_intersection_types
    );
    expect(
      (asyncResult.error.issues[0] as z.ZodInvalidIntersectionTypesIssue)
        .mergeErrorPath
    ).toEqual(["phrase"]);
  }
});

test("invalid deep merge of object and array combination", async () => {
  const University = z.sObject({
    students: z.sArray(
      z.sObject({
        name: z.sString().transform((val) => `Student name: ${val}`),
      })
    ),
  });
  const Registry = z
    .sObject({
      students: z.sArray(
        z.sObject({
          name: z.sString(),
          surname: z.sString(),
        })
      ),
    })
    .and(University);

  const students = [{ name: "John", surname: "Doe" }];

  const syncResult = Registry.safeParse({ students });
  expect(syncResult.success).toEqual(false);
  if (!syncResult.success) {
    expect(syncResult.error.issues[0].code).toEqual(
      z.ZodIssueCode.invalid_intersection_types
    );
    expect(
      (syncResult.error.issues[0] as z.ZodInvalidIntersectionTypesIssue)
        .mergeErrorPath
    ).toEqual(["students", 0, "name"]);
  }

  const asyncResult = await Registry.spa({ students });
  expect(asyncResult.success).toEqual(false);
  if (!asyncResult.success) {
    expect(asyncResult.error.issues[0].code).toEqual(
      z.ZodIssueCode.invalid_intersection_types
    );
    expect(
      (asyncResult.error.issues[0] as z.ZodInvalidIntersectionTypesIssue)
        .mergeErrorPath
    ).toEqual(["students", 0, "name"]);
  }
});
