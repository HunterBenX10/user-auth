import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import transporter from "../config/nodemailer.js";

// REGISTER (success only)
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.json({ success: false, message: "Missing required fields" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Flux!",
      text: `Hi ${name},\n\nWelcome to Flux! Your account has been successfully created.\n\nBest regards,\nThe Flux Team`,
    });

    return res.json({ success: true, message: "Registered successfully" });
  } catch (error) {
    console.error("Registration/Email error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.json({ success: false, message: "Email and password required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// LOGOUT
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// VERIFY (GET CURRENT USER)
export const sendverifyOtp = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "Missing userId" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.isVerified)
      // changed
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Account Verification OTP Code",
      text: `Your OTP code is ${otp}. It is valid for 24 hours.`,
    });

    await transporter.sendMail(mailOption);

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const userId = req.userId || req.body.userId;
    const { otp } = req.body;

    if (!otp)
      return res
        .status(400)
        .json({ success: false, message: "OTP is required" });
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "Missing userId" });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (!user.verifyOtp || user.verifyOtp !== String(otp).trim())
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (user.verifyOtpExpireAt && Number(user.verifyOtpExpireAt) < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    user.isVerified = true; // changed
    user.verifyOtp = "";
    user.verifyOtpExpireAt = null;
    await user.save();

    return res.json({
      success: true,
      message: "Account verified successfully",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Verify the Email using OTP
export const isAuthenticated = (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Not Authorized. Login Again" });
  }

  try {
    return res.json({ success: true, message: "User is authenticated" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error: " + error.message });
  }
};

// Send Password Reset OTP to Email
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Password Reset OTP Code",
      text: `Your OTP code for resetting your password is ${otp}. Use this code to reset your password. It is valid for 15 minutes.`,
    });

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Reset Password using OTP
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
