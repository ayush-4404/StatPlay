
// require("dotenv").config({path : './.env'});
require('dotenv').config();
const connectDB = require("./db/index");
const  app = require("./app");
// console.log(process.env.MONGODB_URI);

const PORT = process.env.PORT || 8000;

connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`🚀 Backend server is running on port ${PORT}`);
        console.log(`📱 Open React app at http://localhost:3000`);
    })
})
.catch((err)=>{
    console.log("MONGO DB connection failed");
    
})