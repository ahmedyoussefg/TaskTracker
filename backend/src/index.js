import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`[INFO] Server is running on port ${PORT}`);
});

pool.query("SELECT NOW()")
    .then((res) => {
        console.log("[INFO] Database connected at: ", res.rows[0].now);
    })
    .catch((err) => {
        console.log("[ERROR] Database connection error: ", err);
    });