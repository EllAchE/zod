// @ts-ignore TS6133
import { test } from "@jest/globals";

import { z } from "..";

interface Category {
  name: string;
  subcategories: Category[];
}

const testCategory: Category = {
  name: "I",
  subcategories: [
    {
      name: "A",
      subcategories: [
        {
          name: "1",
          subcategories: [
            {
              name: "a",
              subcategories: [],
            },
          ],
        },
      ],
    },
  ],
};

test("recursion with z.late.sObject", () => {
  const Category: z.ZodType<Category> = z.late.sObject(() => ({
    name: z.sString(),
    subcategories: z.sArray(Category),
  }));
  Category.parse(testCategory);
});

test("recursion with z.lazy", () => {
  const Category: z.ZodType<Category> = z.lazy(() =>
    z.sObject({
      name: z.sString(),
      subcategories: z.sArray(Category),
    })
  );
  Category.parse(testCategory);
});

test("schema getter", () => {
  z.lazy(() => z.sString()).schema.parse("asdf");
});

type LinkedList = null | { value: number; next: LinkedList };

const linkedListExample = {
  value: 1,
  next: {
    value: 2,
    next: {
      value: 3,
      next: {
        value: 4,
        next: null,
      },
    },
  },
};

test("recursion involving union type", () => {
  const LinkedListSchema: z.ZodType<LinkedList> = z.lazy(() =>
    z.sUnion([
      z.null(),
      z.sObject({
        value: z.sNumber(),
        next: LinkedListSchema,
      }),
    ])
  );
  LinkedListSchema.parse(linkedListExample);
});

// interface A {
//   val: number;
//   b: B;
// }

// interface B {
//   val: number;
//   a: A;
// }

// const A: z.ZodType<A> = z.late.sObject(() => ({
//   val: z.sNumber(),
//   b: B,
// }));

// const B: z.ZodType<B> = z.late.sObject(() => ({
//   val: z.sNumber(),
//   a: A,
// }));

// const Alazy: z.ZodType<A> = z.lazy(() => z.sObject({
//   val: z.sNumber(),
//   b: B,
// }));

// const Blazy: z.ZodType<B> = z.lazy(() => z.sObject({
//   val: z.sNumber(),
//   a: A,
// }));

// const a: any = { val: 1 };
// const b: any = { val: 2 };
// a.b = b;
// b.a = a;

// test('valid check', () => {
//   A.parse(a);
//   B.parse(b);
// });

// test("valid check lazy", () => {
//   A.parse({val:1, b:});
//   B.parse(b);
// });

// test('masking check', () => {
//   const FragmentOnA = z
//     .sObject({
//       val: z.sNumber(),
//       b: z
//         .sObject({
//           val: z.sNumber(),
//           a: z
//             .sObject({
//               val: z.sNumber(),
//             })
//             .nonstrict(),
//         })
//         .nonstrict(),
//     })
//     .nonstrict();

//   const fragment = FragmentOnA.parse(a);
//   fragment;
// });

// test('invalid check', () => {
//   expect(() => A.parse({} as any)).toThrow();
// });

// test('schema getter', () => {
//   (A as z.ZodLazy<any>).schema;
// });

// test("self recursion with cyclical data", () => {
//   interface Category {
//     name: string;
//     subcategories: Category[];
//   }

//   const Category: z.ZodType<Category> = z.late.sObject(() => ({
//     name: z.sString(),
//     subcategories: z.sArray(Category),
//   }));

//   const untypedCategory: any = {
//     name: "Category A",
//   };
//   // creating a cycle
//   untypedCategory.subcategories = [untypedCategory];
//   Category.parse(untypedCategory);
// });

// test("self recursion with base type", () => {
//   const BaseCategory = z.sObject({
//     name: z.sString(),
//   });
//   type BaseCategory = z.infer<typeof BaseCategory>;

//   type Category = BaseCategory & { subcategories: Category[] };

//   const Category: z.ZodType<Category> = z.late
//     .sObject(() => ({
//       subcategories: z.sArray(Category),
//     }))
//     .extend({
//       name: z.sString(),
//     });

//   const untypedCategory: any = {
//     name: "Category A",
//   };
//   // creating a cycle
//   untypedCategory.subcategories = [untypedCategory];
//   Category.parse(untypedCategory); // parses successfully
// });
