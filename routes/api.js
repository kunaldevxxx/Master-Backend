import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import authMiddleWare from "../Middleware/Authenticate.js";
import ProfileController from "../controllers/ProfileController.js";
const router=Router()
router.post("/auth/register" ,AuthController.register);
router.post("/auth/login" ,AuthController.Signin);

router.get("/profile",authMiddleWare,ProfileController.index)
router.put("/profile/:id",authMiddleWare, ProfileController.update); //Private route

export default router;