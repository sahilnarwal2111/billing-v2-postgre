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
const prisma_1 = require("../../generated/prisma");
const zodValidation_1 = require("../zodValidation");
const bcrypt_ts_1 = require("bcrypt-ts");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma = new prisma_1.PrismaClient();
const router = express_1.default.Router();
dotenv_1.default.config();
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
router.post('/signup', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = req.body;
        const { success, error } = zodValidation_1.signupSchema.safeParse(body);
        if (!success) {
            return res.status(411).json({ msg: "Invalid Inputs !", errors: error.errors });
        }
        // checking whether this already exists or not !
        const existingUser = yield prisma.user.findFirst({
            where: {
                email: body.email
            }
        });
        if (existingUser) {
            return res.status(411).json({ msg: "Email already exists" });
        }
        const salt = (0, bcrypt_ts_1.genSaltSync)(10);
        const hashedPassword = (0, bcrypt_ts_1.hashSync)(req.body.password, salt);
        const newUser = yield prisma.user.create({
            data: {
                email: req.body.email,
                password: hashedPassword,
                firstName: req.body.firstName,
                lastName: req.body.lastName
            }
        });
        const UserId = newUser.id;
        const token = jsonwebtoken_1.default.sign({
            id: UserId, email: req.body.email
        }, jwtSecret);
        return res.status(200).json({
            msg: "User Created Successfully !",
            token: token
        });
    });
});
exports.default = router;
