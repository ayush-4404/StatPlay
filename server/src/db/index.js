const mongoose = require("mongoose");
const {DB_NAME} = require("../constants");

const connectDB = async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}`)
        // await mongoose.connect(`/${DB_NAME}`)
    } catch (error){
        console.error("MongoDB connection ERROR : ", error);
        // throw error;
        process.exit(1);
        
    }
}

module.exports =  connectDB;