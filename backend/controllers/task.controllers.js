import fs from "fs";
import path from "path";
import Task from "../models/task.js";
import User from "../models/user.js";

const buildTaskFilter = (req) => {
  const filter = {};

  if (req.user.role !== "admin") {
    filter.$or = [{ createdBy: req.user._id }, { assignedTo: req.user._id }];
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
  if (req.query.dueBefore || req.query.dueAfter) {
    filter.dueDate = {};
    if (req.query.dueBefore) filter.dueDate.$lte = new Date(req.query.dueBefore);
    if (req.query.dueAfter) filter.dueDate.$gte = new Date(req.query.dueAfter);
  }

  return filter;
};

const canManageTask = (req, task) => {
  if (req.user.role === "admin") return true;

  return (
    task.createdBy?._id?.toString() === req.user._id.toString() ||
    task.createdBy?.toString() === req.user._id.toString()
  );
};

const canViewTask = (req, task) => {
  return (
    req.user.role === "admin" ||
    task.createdBy?.toString() === req.user._id.toString() ||
    task.assignedTo?.toString() === req.user._id.toString()
  );
};

const mapFilesToDocuments = (files = []) => {
  return files.map((file) => ({
    originalName: file.originalname,
    fileName: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
  }));
};

const cleanupFiles = (files = []) => {
  files.forEach((file) => {
    fs.unlink(file.path, () => {});
  });
};

const getAllTasks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const allowedSortFields = ["createdAt", "updatedAt", "status", "priority", "dueDate"];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const filter = buildTaskFilter(req);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate("createdBy", "name email role")
        .populate("assignedTo", "name email role")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      count: tasks.length,
      total,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (!title) {
      cleanupFiles(req.files);
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        cleanupFiles(req.files);
        return res.status(404).json({ success: false, message: "Assigned user not found" });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      documents: mapFilesToDocuments(req.files),
    });

    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    cleanupFiles(req.files);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const canView =
      req.user.role === "admin" ||
      task.createdBy._id.toString() === req.user._id.toString() ||
      task.assignedTo?._id?.toString() === req.user._id.toString();

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this task",
      });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      cleanupFiles(req.files);
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!canManageTask(req, task)) {
      cleanupFiles(req.files);
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this task",
      });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        cleanupFiles(req.files);
        return res.status(404).json({ success: false, message: "Assigned user not found" });
      }
      task.assignedTo = assignedTo;
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    const newDocuments = mapFilesToDocuments(req.files);
    if (task.documents.length + newDocuments.length > 3) {
      cleanupFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "A task can have at most 3 documents",
      });
    }
    task.documents.push(...newDocuments);

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: populatedTask,
    });
  } catch (error) {
    cleanupFiles(req.files);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!canManageTask(req, task)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this task",
      });
    }

    task.documents.forEach((document) => {
      fs.unlink(document.path, () => {});
    });
    await task.deleteOne();

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const downloadTaskDocument = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!canViewTask(req, task)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this document",
      });
    }

    const document = task.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    return res.download(path.resolve(document.path), document.originalName);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const viewTaskDocument = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!canViewTask(req, task)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this document",
      });
    }

    const document = task.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${document.originalName}"`);
    return res.sendFile(path.resolve(document.path));
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteTaskDocument = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!canManageTask(req, task)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this document",
      });
    }

    const document = task.documents.id(req.params.documentId);
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    fs.unlink(document.path, () => {});
    task.documents.pull(document._id);
    await task.save();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export {
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  downloadTaskDocument,
  viewTaskDocument,
  deleteTaskDocument,
};
