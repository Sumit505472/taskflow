import fs from "fs";
import mongoose from "mongoose";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value);
const isValidDate = (value) => !Number.isNaN(Date.parse(value));
const hasText = (value) => typeof value === "string" && value.trim().length > 0;
const isPositiveInteger = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

const cleanupUploadedFiles = (files = []) => {
  files.forEach((file) => {
    fs.unlink(file.path, () => {});
  });
};

const sendValidationError = (res, errors, files = []) => {
  cleanupUploadedFiles(files);

  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors,
  });
};

const validateObjectIdParam = (paramName = "id") => {
  return (req, res, next) => {
    if (!isValidObjectId(req.params[paramName])) {
      return sendValidationError(res, [`Invalid ${paramName}`]);
    }

    next();
  };
};

const validateAuthRegister = (req, res, next) => {
  const errors = [];
  const { name, email, password } = req.body;

  if (!hasText(name)) errors.push("Name is required");
  if (!hasText(email)) errors.push("Email is required");
  else if (!isValidEmail(email)) errors.push("Email is invalid");
  if (!password) errors.push("Password is required");
  else if (typeof password !== "string") errors.push("Password must be a string");
  else if (password.length < 6) errors.push("Password must be at least 6 characters");

  if (errors.length) return sendValidationError(res, errors);
  next();
};

const validateAdminSeed = (req, res, next) => {
  const errors = [];
  const { name, email, password, seedKey } = req.body;

  if (!hasText(name)) errors.push("Name is required");
  if (!hasText(email)) errors.push("Email is required");
  else if (!isValidEmail(email)) errors.push("Email is invalid");
  if (!password) errors.push("Password is required");
  else if (typeof password !== "string") errors.push("Password must be a string");
  else if (password.length < 6) errors.push("Password must be at least 6 characters");
  if (seedKey !== undefined && typeof seedKey !== "string") {
    errors.push("Seed key must be a string");
  }

  if (errors.length) return sendValidationError(res, errors);
  next();
};

const validateAuthLogin = (req, res, next) => {
  const errors = [];
  const { email, password } = req.body;

  if (!hasText(email)) errors.push("Email is required");
  else if (!isValidEmail(email)) errors.push("Email is invalid");
  if (!password) errors.push("Password is required");
  else if (typeof password !== "string") errors.push("Password must be a string");

  if (errors.length) return sendValidationError(res, errors);
  next();
};

const validateUserCreate = (req, res, next) => {
  const errors = [];
  const { name, email, password, role } = req.body;

  if (!hasText(name)) errors.push("Name is required");
  if (!hasText(email)) errors.push("Email is required");
  else if (!isValidEmail(email)) errors.push("Email is invalid");
  if (!password) errors.push("Password is required");
  else if (typeof password !== "string") errors.push("Password must be a string");
  else if (password.length < 6) errors.push("Password must be at least 6 characters");
  if (role && !["user", "admin"].includes(role)) errors.push("Role must be user or admin");

  if (errors.length) return sendValidationError(res, errors);
  next();
};

const validateUserUpdate = (req, res, next) => {
  const errors = [];
  const { name, email, password, role } = req.body;

  if (name !== undefined && !hasText(name)) errors.push("Name cannot be empty");
  if (email !== undefined && !isValidEmail(email)) errors.push("Email is invalid");
  if (password !== undefined && typeof password !== "string") {
    errors.push("Password must be a string");
  } else if (password !== undefined && password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  if (role && !["user", "admin"].includes(role)) errors.push("Role must be user or admin");

  if (errors.length) return sendValidationError(res, errors);
  next();
};

const validateUserListQuery = (req, res, next) => {
  const errors = [];
  const allowedSortFields = ["name", "email", "role", "createdAt", "updatedAt"];

  if (req.query.role && !["user", "admin"].includes(req.query.role)) {
    errors.push("Role must be user or admin");
  }
  if (req.query.page && !isPositiveInteger(req.query.page)) {
    errors.push("Page must be a positive integer");
  }
  if (req.query.limit && !isPositiveInteger(req.query.limit)) {
    errors.push("Limit must be a positive integer");
  }
  if (req.query.sortBy && !allowedSortFields.includes(req.query.sortBy)) {
    errors.push("sortBy is invalid");
  }
  if (req.query.sortOrder && !["asc", "desc"].includes(req.query.sortOrder)) {
    errors.push("sortOrder must be asc or desc");
  }

  if (errors.length) return sendValidationError(res, errors);
  next();
};

const validateTaskListQuery = (req, res, next) => {
  const errors = [];
  const allowedStatuses = ["todo", "in-progress", "done"];
  const allowedPriorities = ["low", "medium", "high"];
  const allowedSortFields = ["createdAt", "updatedAt", "status", "priority", "dueDate"];

  if (req.query.status && !allowedStatuses.includes(req.query.status)) {
    errors.push("Status must be todo, in-progress, or done");
  }
  if (req.query.priority && !allowedPriorities.includes(req.query.priority)) {
    errors.push("Priority must be low, medium, or high");
  }
  if (req.query.assignedTo && !isValidObjectId(req.query.assignedTo)) {
    errors.push("Assigned user id is invalid");
  }
  if (req.query.page && !isPositiveInteger(req.query.page)) {
    errors.push("Page must be a positive integer");
  }
  if (req.query.limit && !isPositiveInteger(req.query.limit)) {
    errors.push("Limit must be a positive integer");
  }
  if (req.query.dueBefore && !isValidDate(req.query.dueBefore)) {
    errors.push("dueBefore must be a valid date");
  }
  if (req.query.dueAfter && !isValidDate(req.query.dueAfter)) {
    errors.push("dueAfter must be a valid date");
  }
  if (req.query.sortBy && !allowedSortFields.includes(req.query.sortBy)) {
    errors.push("sortBy is invalid");
  }
  if (req.query.sortOrder && !["asc", "desc"].includes(req.query.sortOrder)) {
    errors.push("sortOrder must be asc or desc");
  }

  if (errors.length) return sendValidationError(res, errors, req.files);
  next();
};

const validateTaskCreate = (req, res, next) => {
  const errors = [];
  const { title, status, priority, dueDate, assignedTo } = req.body;

  if (!hasText(title)) errors.push("Title is required");
  if (status && !["todo", "in-progress", "done"].includes(status)) {
    errors.push("Status must be todo, in-progress, or done");
  }
  if (priority && !["low", "medium", "high"].includes(priority)) {
    errors.push("Priority must be low, medium, or high");
  }
  if (dueDate && !isValidDate(dueDate)) errors.push("Due date must be a valid date");
  if (assignedTo && !isValidObjectId(assignedTo)) errors.push("Assigned user id is invalid");
  if (req.files?.length > 3) errors.push("A task can have at most 3 documents");

  if (errors.length) return sendValidationError(res, errors, req.files);
  next();
};

const validateTaskUpdate = (req, res, next) => {
  const errors = [];
  const { title, status, priority, dueDate, assignedTo } = req.body;

  if (title !== undefined && !hasText(title)) errors.push("Title cannot be empty");
  if (status && !["todo", "in-progress", "done"].includes(status)) {
    errors.push("Status must be todo, in-progress, or done");
  }
  if (priority && !["low", "medium", "high"].includes(priority)) {
    errors.push("Priority must be low, medium, or high");
  }
  if (dueDate && !isValidDate(dueDate)) errors.push("Due date must be a valid date");
  if (assignedTo && !isValidObjectId(assignedTo)) errors.push("Assigned user id is invalid");
  if (req.files?.length > 3) errors.push("A task can have at most 3 documents");

  if (errors.length) return sendValidationError(res, errors, req.files);
  next();
};

export {
  validateObjectIdParam,
  validateAuthRegister,
  validateAdminSeed,
  validateAuthLogin,
  validateUserCreate,
  validateUserUpdate,
  validateUserListQuery,
  validateTaskListQuery,
  validateTaskCreate,
  validateTaskUpdate,
};
