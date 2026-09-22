import { Router } from "express";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/access-request", authController.requestAccess);

export default router;
