import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import authMiddleWare from "../Middleware/Authenticate.js";
import ProfileController from "../controllers/ProfileController.js";
import NewsController from "../controllers/NewsController.js";
const router=Router();
router.post("/auth/register" ,AuthController.register);
router.post("/auth/login" ,AuthController.Signin);

router.get("/profile",authMiddleWare,ProfileController.index)
router.put("/profile/:id",authMiddleWare, ProfileController.update); //Private route

router.get("/news",NewsController.index);
router.post("/news",authMiddleWare,NewsController.store);
router.get("/news/:id",NewsController.show);
router.put("/news/:id",NewsController.update);
router.delete("/news/:id",NewsController.Destroy);

export default router;