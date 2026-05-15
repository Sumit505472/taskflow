import express from 'express';
import dotenv from 'dotenv';
import DBConnection from './config/db.js';
import authRoutes from './routes/auth.routes.js';
dotenv.config();

const app=express();

DBConnection();
app.use(express.json());

app.use("/api/auth",authRoutes);



app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
});