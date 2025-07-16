"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organisationSchema = exports.billSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const signupSchema = zod_1.default.object({
    firstName: zod_1.default.string(),
    lastName: zod_1.default.string().optional(),
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(5)
});
exports.signupSchema = signupSchema;
const loginSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(5)
});
exports.loginSchema = loginSchema;
const billSchema = zod_1.default.object({
    customerName: zod_1.default.string().min(4),
    itemsPurchased: zod_1.default.array(zod_1.default.object({
        itemName: zod_1.default.string(),
        quantityPurchased: zod_1.default.number(),
        priceOfItem: zod_1.default.number(),
    })),
    organisation: zod_1.default.number()
});
exports.billSchema = billSchema;
const organisationSchema = zod_1.default.object({
    name: zod_1.default.string().min(4),
    subHeading: zod_1.default.string().optional(),
    contactNumber: zod_1.default.string(),
    contactEmail: zod_1.default.string(),
    gstNumber: zod_1.default.string(),
    address: zod_1.default.string()
});
exports.organisationSchema = organisationSchema;
