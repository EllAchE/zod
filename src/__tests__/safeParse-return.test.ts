import * as z from "../index";

const simpleSchema = z.sString()
const transformSchema = z.sObject({
    a: z.sNumber().transform(() => 2),
    b: z.sString(),
    c: z.sString().transform(() => 4)
}) 

test("safeParse returns data when parse fails", () => {
    const result = simpleSchema.safeParse(9)
    expect(result.success).toBe(false)
    expect(result.data).toBe(9)
  });

test("safeParse returns transformed data when transform succeeds", () => {
    const result = transformSchema.safeParse({
        a: 9,
        b: 9,
        c: 9
    })
    expect(result.success).toBe(false)
    expect(result.data).toEqual({
        a: 2,
        b: 9,
        c: 9
    })
})