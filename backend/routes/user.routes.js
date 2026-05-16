import express from "express";
import {
getAllUsers,
createUser,
getUserById,
updateUser,
deleteUser
} from "../controllers/user.controller.js";
import { authMiddleware, adminOnly } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, adminOnly, getAllUsers);
router.post("/", authMiddleware, adminOnly, createUser);
router.get("/:id", authMiddleware, getUserById);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, adminOnly, deleteUser);


export default router;
