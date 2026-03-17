const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const cors = require("cors");
const path = require("path");

// CORS configuration for React frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({
    limit:"16kb"
}));
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, "../public")));
app.use(cookieParser())

const userRouter = require("./routes/user.routes");
const quizRouter = require("./routes/quiz.routes");
const adminRouter = require("./routes/admin.routes");

// API routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/quiz", quizRouter);
app.use("/api/v1/admin", adminRouter);

// Legacy quiz routes (for backward compatibility)
app.use("/quiz", quizRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "StatPlay API is running" });
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: message,
        errors: err.errors || [],
        data: null
    });
});


module.exports = app;