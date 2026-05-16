import express from "express";
import {
  register,
  seedAdmin,
  login,
  me,
  logout,
} from "../controllers/auth.controller.js";
import {
  validateAdminSeed,
  validateAuthLogin,
  validateAuthRegister,
} from "../middleware/validation.middleware.js";

const router = express.Router();

router.post("/register", validateAuthRegister, register);
router.post("/seed-admin", validateAdminSeed, seedAdmin);
router.post("/login", validateAuthLogin, login);
router.get("/me", me);
router.post("/logout", logout);

export default router;
