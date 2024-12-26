const mongoose = require("mongoose");

const connectDB =async () => {
 const result=await mongoose.connect(process.env.MONGODB_URI,{});
  if(mongoose.connection.readyState===1){
    console.log("DB connect successfully ");
  }
  else{
    console.log("DB is not connected");
  }
  return result;
  
};

module.exports = connectDB;

