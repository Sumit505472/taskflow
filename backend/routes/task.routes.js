import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  downloadTaskDocument,
  viewTaskDocument,
  deleteTaskDocument,
} from "../controllers/task.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validateObjectIdParam,
  validateTaskCreate,
  validateTaskListQuery,
  validateTaskUpdate,
} from "../middleware/validation.middleware.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads", "tasks");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 3,
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF documents are allowed"));
    }
    cb(null, true);
  },
});

const uploadDocuments = (req, res, next) => {
  upload.array("documents", 3)(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next();
  });
};

router.get("/", authMiddleware, validateTaskListQuery, getAllTasks);
router.post("/", authMiddleware, uploadDocuments, validateTaskCreate, createTask);
router.get("/:id", authMiddleware, validateObjectIdParam("id"), getTaskById);
router.put("/:id", authMiddleware, validateObjectIdParam("id"), uploadDocuments, validateTaskUpdate, updateTask);
router.delete("/:id", authMiddleware, validateObjectIdParam("id"), deleteTask);
const validateDocumentParams = [
  validateObjectIdParam("taskId"),
  validateObjectIdParam("documentId"),
];

router.get(
  "/:taskId/documents/:documentId",
  authMiddleware,
  validateDocumentParams,
  downloadTaskDocument
);
router.get(
  "/:taskId/documents/:documentId/view",
  authMiddleware,
  validateDocumentParams,
  viewTaskDocument
);
router.delete(
  "/:taskId/documents/:documentId",
  authMiddleware,
  validateDocumentParams,
  deleteTaskDocument
);

export default router;
