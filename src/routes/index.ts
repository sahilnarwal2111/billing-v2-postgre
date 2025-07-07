import express from 'express'
import userRouter from './user'
// import billRouter from './bill'

const router = express.Router();

router.use('/user', userRouter)
// router.use('/bill', billRouter)

export default router