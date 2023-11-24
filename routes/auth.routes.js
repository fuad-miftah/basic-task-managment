import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import { createSuccess } from "../utils/success.js";

const router = express.Router();

router.post("/register", register)
router.post("/login", login)
router.post("/logout", (req, res) => {
    res.clearCookie("access_token").send(createSuccess("Logged out successfully."));
})

export default router