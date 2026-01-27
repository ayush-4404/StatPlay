const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

const cors = require("cors");
const path = require("path");

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({
    limit:"16kb"
}));
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, "../public")));
app.use(cookieParser())
app.set("view engine", "ejs")

const userRouter = require("./routes/user.routes");

app.use("/api/v1/users", userRouter);


module.exports = app;