const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const cors = require("cors");
const path = require("path");

// CORS configuration for React frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
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

// API routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/quiz", quizRouter);

// Legacy quiz routes (for backward compatibility)
app.use("/quiz", quizRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "StatPlay API is running" });
});


module.exports = app;