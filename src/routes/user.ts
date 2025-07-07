import express, { Request, Response } from 'express'
import { PrismaClient } from '../../generated/prisma'
import { signupSchema, loginSchema } from '../zodValidation';
import { genSaltSync, hashSync } from "bcrypt-ts";
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import dotenv  from 'dotenv';


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

export default router