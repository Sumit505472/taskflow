import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

import DBConnection from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import taskRoutes from './routes/task.routes.js';
import cors from 'cors';

const app=express();

DBConnection();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://65.2.79.177:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/tasks", taskRoutes);
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server healthy"
  });
});



app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
});
