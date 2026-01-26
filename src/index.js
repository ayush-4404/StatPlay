
// require("dotenv").config({path : './.env'});
require('dotenv').config();
const connectDB = require("./db/index");
const  app = require("./app");
// console.log(process.env.MONGODB_URI);

connectDB().then(()=>{
    app.listen(process.env.PORT||3000, ()=>{
        console.log(`server is running on port ${process.env.PORT}`);
        
    })
})
.catch((err)=>{
    console.log("MONGO DB connection failed");
    
})
app.get("/", (req, res)=>{
    res.render("index");
})
app.get("/register", (req, res)=>{
    res.render("register");
})
app.get("/login", (req, res)=>{
    res.render("login");
})


// app.get("/", (req,res)=>{
//     res.render("index")
// })  

// app.listen(3000);