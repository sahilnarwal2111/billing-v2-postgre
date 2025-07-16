"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const middleware_1 = __importDefault(require("../middleware"));
const client_1 = require("@prisma/client");
const zodValidation_1 = require("../zodValidation");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post('/create', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { success, error } = zodValidation_1.billSchema.safeParse(body);
    if (!success) {
        return res.status(411).json({ msg: "Wrong inputs in bills " + error });
    }
    const itemsPurchased = body.itemsPurchased;
    let amount = 0;
    for (let i = 0; i < itemsPurchased.length; i++) {
        let element = itemsPurchased[i];
        amount += element.priceOfItem * element.quantityPurchased;
    }
    const newBill = yield prisma.bill.create({
        data: {
            customerName: body.customerName,
            itemsPurchased: {
                create: itemsPurchased
            },
            user: {
                connect: { id: req.body.id }
            },
            organisation: {
                connect: { id: req.body.organisation }
            },
            amount: amount,
        }
    });
    const billId = newBill.id;
    res.status(201).json({
        message: "Bill Created Successfully",
        bill: newBill,
        billId: billId
    });
}));
router.post('/update', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { success } = zodValidation_1.billSchema.safeParse(body);
    if (!success) {
        return res.status(411).json({ msg: "Input invalids" });
    }
    const bill = yield prisma.bill.findFirst({
        where: {
            id: body.billId
        }
    });
    if (!bill) {
        return res.status(404).json({ msg: "Bill not found" });
    }
    const itemsPurchased = body.itemsPurchased;
    let amount = 0;
    for (let i = 0; i < itemsPurchased.length; i++) {
        let element = itemsPurchased[i];
        amount += element.priceOfItem * element.quantityPurchased;
    }
    yield prisma.item.deleteMany({
        where: { billId: body.billId }
    });
    const updatedBill = yield prisma.bill.update({
        where: {
            id: body.id
        },
        data: {
            customerName: body.customerName,
            itemsPurchased: {
                create: itemsPurchased
            },
            user: {
                connect: { id: req.body.id }
            },
            organisation: {
                connect: { id: req.body.organisation }
            },
            amount: amount,
        }
    });
    return res.status(200).json({
        message: "Bill updated successfully",
        bill: updatedBill
    });
}));
exports.default = router;
