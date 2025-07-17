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
const client_1 = require("@prisma/client");
const zodValidation_1 = require("../zodValidation");
const bcrypt_ts_1 = require("bcrypt-ts");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const middleware_1 = __importDefault(require("../middleware"));
const prisma = new client_1.PrismaClient();
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
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { success, error } = zodValidation_1.loginSchema.safeParse(body);
    if (!success) {
        return res.status(411).json({ msg: "Invalid Inputs !", errors: error.errors });
    }
    // checking whether this already exists or not !
    const existingUser = yield prisma.user.findFirst({
        where: {
            email: body.email
        }
    });
    if (!existingUser) {
        return res.status(411).json({ msg: "User not found" });
    }
    const isMatch = (0, bcrypt_ts_1.compareSync)(body.password, existingUser.password);
    if (!isMatch) {
        return res.status(411).json({ msg: "Incorrect password " });
    }
    const UserId = existingUser.id;
    const token = jsonwebtoken_1.default.sign({
        id: UserId, email: req.body.email
    }, jwtSecret);
    return res.status(200).json({
        msg: "Login Successfully !",
        token: token
    });
}));
router.get('/profile', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.email) {
        return res.status(411).json({ msg: "please send an email" });
    }
    const user = yield prisma.user.findFirst({
        where: {
            email: req.body.email
        }
    });
    return res.status(200).json({ user });
}));
router.post('/addOrganisation', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { success, error } = zodValidation_1.organisationSchema.safeParse(body);
    if (!success) {
        return res.status(411).json({ msg: "Organisation Inputs in API are wrong ! " + error });
    }
    const newOrg = yield prisma.organisation.create({
        data: {
            name: body.name,
            subHeading: body.subHeading,
            contactNumber: body.contactNumber,
            contactEmail: body.contactEmail,
            gstNumber: body.gstNumber,
            address: body.address,
            userId: req.body.id
        }
    });
    return res.status(201).json({
        msg: "Organisation added successfully !",
        newOrg: newOrg
    });
}));
router.get('/organisations', middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.id;
    const organisations = yield prisma.organisation.findMany({
        where: {
            userId: userId
        }
    });
    res.status(200).json({ organisations });
}));
exports.default = router;
