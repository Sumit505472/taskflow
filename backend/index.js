import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import DBConnection from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import taskRoutes from './routes/task.routes.js';
dotenv.config();

const app=express();

DBConnection();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/tasks", taskRoutes);



app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
});
