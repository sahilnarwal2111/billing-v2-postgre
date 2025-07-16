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

// need to make route in which a user can see all bills by orgranisation
router.get('/bills/:organsiationId', authMiddleware, async (req, res)=>{
    const orgId = parseInt(req.params.organsiationId);
    if (isNaN(orgId)) {
    return res.status(400).json({ msg: "Invalid organisation ID" });
  }

  try {
    const bills = await prisma.bill.findMany({
      where: {
        createdBy: req.body.id,
        organisationId: orgId
      },
      include: {
        itemsPurchased: true
      }
    });

    return res.status(200).json({ bills });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Failed to fetch bills" });
  }
})
export default router