import mongoose from "mongoose";

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string, {
            dbName: "foodify",
        });
        console.log("connected to MongoDB");
        
    } catch (error) {
        console.log(error);
        
    }
}

export default connectDB