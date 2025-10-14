import express from "express";
import {
  register,
  login,
  logout,
  verifyUser,
} from "../controllers/authcontroller.js";

const authRouter = express.Router();
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/verify", verifyUser);

export default authRouter;
