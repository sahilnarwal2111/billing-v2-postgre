"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ msg: "Send JWT Token with Bearer in prefix  OR Header in body payload is empty" });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, jwtSecret);
        if (typeof decodedToken === 'object' && 'id' in decodedToken) {
            req.body.id = decodedToken.id;
            next();
        }
        else {
            return res.status(403).json({ msg: "Invalid JWT Token" });
        }
    }
    catch (err) {
        // console.error("JWT error : ", err);
        return res.status(403).json({ msg: "Invalid JWT Token" });
    }
};
exports.default = authMiddleware;
