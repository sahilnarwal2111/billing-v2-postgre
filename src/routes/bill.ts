import express from 'express'
import authMiddleware from '../middleware';
import { PrismaClient } from '@prisma/client'
import { billSchema } from '../zodValidation'

const router = express.Router();
const prisma = new PrismaClient();

router.post('/create', authMiddleware, async (req, res)=>{
    const body = req.body;
    const { success, error } = billSchema.safeParse(body);

    if(!success){
        return res.status(411).json({msg : "Wrong inputs in bills " + error})
    }
    const itemsPurchased = body.itemsPurchased
    let amount = 0;
    for(let i = 0 ; i < itemsPurchased.length; i++){
        let element = itemsPurchased[i];
        amount +=element.priceOfItem * element.quantityPurchased
    }
    const newBill = await prisma.bill.create({
        data : {
            customerName : body.customerName,
            itemsPurchased : { 
                create :  itemsPurchased 
            },
            user : {
                connect : { id : req.body.id}
            },
            organisation : {
                connect : { id : req.body.organisation}
            },
            amount : amount,
        }

    })
    const billId = newBill.id;
    res.status(201).json({
        message : "Bill Created Successfully",
        bill : newBill,
        billId : billId

    })

})

router.post('/update', authMiddleware, async (req, res)=> {
    const body = req.body;
    const { success } = billSchema.safeParse(body);

    if(!success){
        return res.status(411).json({msg : "Input invalids"})
    }

    const bill = await prisma.bill.findFirst({
        where : {
            id : body.billId
        }
    })

    if(!bill){
        return res.status(404).json({msg : "Bill not found"})
    }

    const itemsPurchased = body.itemsPurchased
    let amount = 0;
    for(let i = 0 ; i < itemsPurchased.length; i++){
        let element = itemsPurchased[i];
        amount +=element.priceOfItem * element.quantityPurchased
    }

    await prisma.item.deleteMany({
        where: { billId: body.billId }
    });


    const updatedBill = await prisma.bill.update({
        where : {
            id : body.id
        },
        data : {
            customerName : body.customerName,
            itemsPurchased : { 
                create :  itemsPurchased 
            },
            user : {
                connect : { id : req.body.id}
            },
            organisation : {
                connect : { id : req.body.organisation}
            },
            amount : amount,
        }
    })
    return res.status(200).json({
        message : "Bill updated successfully",
        bill : updatedBill})
})

export default router