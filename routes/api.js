import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import authMiddleWare from "../Middleware/Authenticate.js";
import ProfileController from "../controllers/ProfileController.js";
import NewsController from "../controllers/NewsController.js";
import redisCache from "../DB/redis.config.js";
const router=Router();
router.post("/auth/register" ,AuthController.register);
router.post("/auth/login" ,AuthController.Signin);

router.get("/profile",authMiddleWare,ProfileController.index)
router.put("/profile/:id",authMiddleWare, ProfileController.update); //Private route

router.get("/news",redisCache.route({expire:60*60}),NewsController.index);
router.post("/news",authMiddleWare,NewsController.store);
router.get("/news/:id",NewsController.show);
router.put("/news/:id",authMiddleWare,NewsController.update);
router.delete("/news/:id",NewsController.destroy);

export default router;