import express from "express";
import "dotenv/config";
import helmet from "helmet";
import { limiter } from "./config/ratelimiter.js";
import cors from 'cors';
import fileUpload from "express-fileupload";
const app = express()
import ApiRoutes from "./routes/api.js";
import logger from "./config/logger.js";

const PORT = process.env.PORT || 8000
// Middleware
app.use(express.json());
app.use(express.static("public"))
app.use(helmet())
app.use(cors())
app.use(express.urlencoded({extended:false}));
app.use(fileUpload());
app.use(limiter);
app.get("/",(req,res)=>{
    return res.json({message:"hello"})
});
app.use("/api",ApiRoutes);

app.listen(PORT,()=> console.log(`SERVER RUNNING On ${PORT}`));
