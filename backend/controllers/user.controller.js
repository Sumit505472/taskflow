
import bcrypt from "bcrypt";
import User from "../models/user.js";

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const canAccessUser = (req, userId) => {
  return req.user.role === "admin" || req.user._id.toString() === userId;
};

const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const allowedSortFields = ["name", "email", "role", "createdAt", "updatedAt"];
    const sortBy = allowedSortFields.includes(req.query.sortBy)
      ? req.query.sortBy
      : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      page,
      pages: Math.ceil(total / limit),
      count: users.length,
      total,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getUserById = async (req, res) => {
  try {
    if (!canAccessUser(req, req.params.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this user",
      });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    if (!canAccessUser(req, req.params.id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this user",
      });
    }

    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, password, role } = req.body;

    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role && req.user.role === "admin") user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { getAllUsers, createUser, getUserById, updateUser, deleteUser };
