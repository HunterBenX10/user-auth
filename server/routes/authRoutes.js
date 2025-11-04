import express from "express";
import {
  register,
  login,
  logout,
  sendverifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
} from "../controllers/authcontroller.js";
import userAuth from "../middleware/UserAuth.js";

const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.post("/send-verify-otp", userAuth, sendverifyOtp);
authRouter.post("/verify-account", userAuth, verifyEmail);

// Public auth check (leave public)
authRouter.get("/is-auth", isAuthenticated);

authRouter.post("/send-reset-otp", sendResetOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
