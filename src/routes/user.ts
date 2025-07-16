import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { signupSchema, loginSchema, organisationSchema } from '../zodValidation';
import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";
import jwt from 'jsonwebtoken';
import dotenv  from 'dotenv';
import authMiddleware from '../middleware';


const prisma = new PrismaClient();
const router = express.Router();
dotenv.config()

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

router.post('/signup', async function (req: Request, res: Response): Promise<Response> {
    const body = req.body
    const { success, error } = signupSchema.safeParse(body)

    if(!success){
        return res.status(411).json({msg : "Invalid Inputs !", errors: error.errors })
    }

    // checking whether this already exists or not !
    const existingUser = await prisma.user.findFirst({
        where : {
            email : body.email
        }
    })

    if(existingUser){
        return res.status(411).json({msg : "Email already exists"})
    }

    const salt = genSaltSync(10);
    const hashedPassword = hashSync(req.body.password, salt);

    const newUser = await prisma.user.create({
        data : {
            email : req.body.email,
            password : hashedPassword,
            firstName : req.body.firstName,
            lastName : req.body.lastName
        }
    })
    const UserId = newUser.id;
    const token = jwt.sign({
        id : UserId, email : req.body.email
    }, jwtSecret)

    return res.status(200).json({
        msg : "User Created Successfully !",
        token : token
    })
    
})

router.post('/login', async (req, res) =>{
    const body = req.body;
    const { success, error} = loginSchema.safeParse(body);

    if(!success){
        return res.status(411).json({msg : "Invalid Inputs !", errors: error.errors })
    }

    // checking whether this already exists or not !
    const existingUser = await prisma.user.findFirst({
        where : {
            email : body.email
        }
    })

    if(!existingUser){
        return res.status(411).json({msg : "User not found"})
    }

    const isMatch = compareSync(body.password, existingUser.password);

    if(!isMatch){
        return res.status(411).json({msg : "Incorrect password "})
    }
    const UserId = existingUser.id;
    const token = jwt.sign({
        id : UserId, email : req.body.email
    }, jwtSecret)

    return res.status(200).json({
        msg : "Login Successfully !",
        token : token
    })

})

router.get('/profile', authMiddleware ,async (req, res) =>{
    if(!req.body.email){
        return res.status(411).json({msg : "please send an email"})
    }
    const user = await prisma.user.findFirst({
        where : {
            email : req.body.email
        }
    })

    return res.status(200).json({user});

})

router.post('/addOrganisation', authMiddleware, async (req, res) =>{
    const body = req.body;
    const { success } = organisationSchema.safeParse(body);
    if(!success){
        return res.status(411).json({msg : "Organisation Inputs in API are wrong !"});
    }   

    const newOrg = await prisma.organisation.create({
        data : {
            name : body.name,
            subHeading : body.subHeading,
            contactNumber : body.contactNumber,
            contactEmail : body.contactEmail ,
            gstNumber : body.gstNumber,
            address : body.address,
            userId : req.body.id
        
        }
    })

    return res.status(201).json({
        msg : "Organisation added successfully !",
        newOrg : newOrg
    })

})

router.get('/organisations', authMiddleware, async (req, res)=>{
    const userId = req.body.id;

    const organisations = await prisma.organisation.findMany({
        where : {
            userId : userId
        }
    })

    res.status(200).json({organisations})
})

export default router
