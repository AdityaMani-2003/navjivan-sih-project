// lastpuff-backend/express-app/controllers/AuthController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import User from "../models/User.js";


const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, age, height, weight, plan } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      age: age ? Number(age) : undefined,
      heightCm: height ? Number(height) : undefined,
      weightKg: weight ? Number(weight) : undefined,
      plan: plan === "aggressive" ? "aggressive" : "gradual",
    });

    const token = createToken(user._id);
    const safeUser = sanitizeUser(user);

    return res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error during signup" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = createToken(user._id);
    const safeUser = sanitizeUser(user);

    return res.status(200).json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      age,
      heightCm,
      weightKg,
      plan,
      cigarettesPerDay,
      pricePerPack,
      pricePerCigarette,
      smokingYears,
      quitDate,
      expoPushToken,
    } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (age !== undefined) user.age = Number(age);
    if (heightCm !== undefined) user.heightCm = Number(heightCm);
    if (weightKg !== undefined) user.weightKg = Number(weightKg);
    if (plan !== undefined) user.plan = plan;
    if (cigarettesPerDay !== undefined) user.cigarettesPerDay = Number(cigarettesPerDay);
    if (pricePerPack !== undefined) {
      user.pricePerPack = Number(pricePerPack);
      if (pricePerCigarette === undefined && Number(pricePerPack) > 0) {
        user.pricePerCigarette = Math.round(Number(pricePerPack) / 20) || 10;
      }
    }
    if (pricePerCigarette !== undefined) user.pricePerCigarette = Number(pricePerCigarette);
    if (smokingYears !== undefined) user.smokingYears = Number(smokingYears);
    if (quitDate !== undefined) {
      user.quitDate = quitDate;
      const quit = dayjs(quitDate);
      if (quit.isValid()) {
        const diffDays = Math.max(0, dayjs().diff(quit, "day"));
        user.streak = diffDays;
      }
    }
    if (expoPushToken !== undefined) user.expoPushToken = expoPushToken;

    await user.save();
    const safeUser = sanitizeUser(user);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Server error updating profile" });
  }
};
