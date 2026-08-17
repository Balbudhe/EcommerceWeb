import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./Models/User.js";
import { connectDB } from "./Config/db.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@example.com";
    const password = "ChangeThisPassword123!";
    const name = "Admin";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();