import zod from 'zod';

const signupSchema = zod.object({
    firstName : zod.string(),
    lastName : zod.string().optional(),
    email : zod.string().email(),
    password : zod.string().min(5)
})

const loginSchema = zod.object({
    email : zod.string().email(),
    password : zod.string().min(5)
})

export {signupSchema, loginSchema}