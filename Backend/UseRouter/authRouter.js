import express from "express";
import {registerUser,loginUser,sendVerificationEmail,resetPassword} from "../Controller/Auth.js";


const router=express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/send-verification-email",sendVerificationEmail);
router.post("/reset-password",resetPassword);
export default router;