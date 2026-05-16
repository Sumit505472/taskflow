import express from "express";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authMiddleware, adminOnly } from "../middleware/auth.middleware.js";
import {
  validateObjectIdParam,
  validateUserCreate,
  validateUserListQuery,
  validateUserUpdate,
} from "../middleware/validation.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, adminOnly, validateUserListQuery, getAllUsers);
router.post("/", authMiddleware, adminOnly, validateUserCreate, createUser);
router.get("/:id", authMiddleware, validateObjectIdParam("id"), getUserById);
router.put("/:id", authMiddleware, validateObjectIdParam("id"), validateUserUpdate, updateUser);
router.delete("/:id", authMiddleware, adminOnly, validateObjectIdParam("id"), deleteUser);


export default router;
