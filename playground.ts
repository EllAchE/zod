import { z } from "./src/index";

z;

// const a = z.string().parse("hello");
// console.log(a);

// const b = z.string().safeParse("hello");
// console.log(b.data);

// const c = z.string().multiParse("hello");
// console.log(c.data);

// const d = z.sString().multiParse("hello");
// console.log(d.data);

// const e = z.string()._parse({data: "p", path: [], parent: null as any,})
// const f = z.sString()._parse({data: "p", path: [], parent: null as any,})
// const g = z.number()._parse({data: "p", path: [], parent: null as any,})

// const sss = new StrictZodString("" as any)
// const h = sss.multiParse("hello");

// const obj0 = z.sObject({
//     ns: z.string(),
//     ss: z.sUnion([z.sString(), z.sNumber()])
// }).multiParse({ ns: "hello", ss: "world" })

// if (obj0.success === true) 
//     {
//         console.log(obj0.data);
//     }
//     else {
//         console.log(obj0.data);
//     }

// const obj = z.sObject({
//     s: z.string(),
//     ss: z.sString(),
//     sn: z.sNumber(),
//     n: z.number(),
//     b: z.boolean(),
//     sb: z.sBoolean(),
//     arr: z.array(z.sString()),
//     sarr: z.sArray(z.sString()),
// }).multiParse({ ns: "hello", ss: "world" });

// if (obj.success === true) {
// console.log(obj.data);
// }

// if (obj.success === false) {
//     console.log(obj.data);
// }

// const obj2 = z.sObject({
//     ns: z.string(),
//     ss: z.sString(),
// })._parse({data: { ns: "hello", ss: "world" }, path: [], parent: null as any,});

// const obj3 = z.object({
//     ns: z.string(),
//     ss: z.sString(),
// })._parse({data: { ns: "hello", ss: "world" }, path: [], parent: null as any,});
