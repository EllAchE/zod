import { z } from "./src";


const schem = z.object({
    a: z.string(),
    b: z.string()
})

const schem2 = z.object({
    c: z.string(),
    schem,
})

const b = {
    a: 2,
    b: 9
}

const inp = {
    c: 2,
    schem: b,
}

// const res = schem.safeParse(b)
const res = schem2.safeParse(inp)

// console.dir(JSON.stringify(res.error, null, 2))
// console.dir(res.error)
console.dir(res)