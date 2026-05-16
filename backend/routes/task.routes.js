import express from "express";
import multer from "multer";
import AWS from "aws-sdk";
import multerS3 from "multer-s3";
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

let upload;

const initializeS3 = () => {
  if (upload) return;

  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const storage = multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: "private",
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        userId: req.user._id.toString(),
      });
    },
    key: (req, file, cb) => {
      const uniqueName = `tasks/${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });

  upload = multer({
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
};

const uploadDocuments = (req, res, next) => {
  initializeS3();
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
