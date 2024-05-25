import * as z from "../index";

const simpleSchema = z.string()
const transformSchema = z.object({
    a: z.number().transform(() => 2),
    b: z.string(),
    c: z.string().transform(() => 4)
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