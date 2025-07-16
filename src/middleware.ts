import jwt from 'jsonwebtoken';
import dotenv  from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { object } from 'zod';

dotenv.config()

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) =>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(403).json({msg : "Send JWT Token with Bearer in prefix  OR Header in body payload is empty"})
    }
    const token = authHeader.split(' ')[1];
    try{
        const decodedToken = jwt.verify(token, jwtSecret);

        if(typeof decodedToken === 'object' && 'id' in decodedToken){
            req.body.id = decodedToken.id;
            next();
        }else{
            return res.status(403).json({msg : "Invalid JWT Token"})
        }
    }
    catch(err){
        // console.error("JWT error : ", err);
        return res.status(403).json({msg : "Invalid JWT Token"});
    }
}

export default authMiddleware;