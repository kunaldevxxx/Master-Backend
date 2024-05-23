import express from "express";
import "dotenv/config";
const app = express()
import ApiRoutes from "./routes/api.js";

const PORT = process.env.PORT || 8000
// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.get("/",(req,res)=>{
    return res.json({message:"hello"})
});
app.use("/api",ApiRoutes);
app.listen(PORT,()=> console.log(`SERVER RUNNING On ${PORT}`));
