import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const signUserToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existuser = await User.findOne({ email });
    if (existuser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashpassword, role: "user" });
    res.status(201).json({
      message: "User created successfully",
      token: signUserToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }
    res.status(200).json({
      message: "Login successful",
      token: signUserToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const sendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        message: "Email is not configured. Check EMAIL_USER and EMAIL_PASS in .env",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is missing in .env" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(
      /\/$/,
      ""
    );
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Gmail App Password must have NO spaces
    const appPassword = String(process.env.EMAIL_PASS).replace(/\s+/g, "");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: appPassword,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: `"Artiqulate Lifestyle" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your Artiqulate password",
      text: `Hello ${user.name},\n\nClick this link to reset your password (valid for 10 minutes):\n${resetLink}\n\nIf you did not request this, ignore this email.`,
      html: `
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>Click the button below to reset your password. This link expires in <strong>10 minutes</strong>.</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#0f6b5c;color:#fff;text-decoration:none;border-radius:8px;">Reset password</a></p>
        <p>Or copy this link:<br/><a href="${resetLink}">${resetLink}</a></p>
      `,
    });

    return res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    console.error("sendVerificationEmail error:", error);

    let message = "Failed to send email";
    if (
      error.code === "EAUTH" ||
      /Invalid login|Username and Password not accepted/i.test(error.message || "")
    ) {
      message =
        "Gmail login failed. Use a Gmail App Password (not your normal password) and remove spaces in EMAIL_PASS.";
    } else if (error.message) {
      message = error.message;
    }

    return res.status(500).json({
      message,
      error: error.message,
    });
  }
};

export const resetPassword=async(req,res)=>{
    try{
        const {token,password}=req.body;
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await User.findById(decoded.id);
        if(!user){
            return res.status(400).json({message:"User not found"});
        }
        const hashpassword=await bcrypt.hash(password,10);
        user.password=hashpassword;
        await user.save();
        res.status(200).json({message:"Password reset successfully"});
    }
    catch(error){
        res.status(500).json({message:"Internal server error",error:error.message});
    }
}
