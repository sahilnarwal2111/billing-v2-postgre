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

const billSchema = zod.object({
    customerName : zod.string().min(4),
    itemsPurchased : zod.array(zod.object({
        itemName : zod.string(),
        quantityPurchased : zod.number(),
        priceOfItem : zod.number(),
    })),
    organisation : zod.number()
})

const organisationSchema = zod.object({
    name : zod.string().min(4),
    subHeading : zod.string().optional(),
    contactNumber : zod.string(),
    contactEmail : zod.string(),
    gstNumber : zod.string(),
    address : zod.string()
})

export {signupSchema, loginSchema, billSchema, organisationSchema}