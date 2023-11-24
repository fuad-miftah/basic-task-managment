import express from "express";
import { getAllTasks, getTaskById, updateTask, deleteTask, createTask } from "../controllers/task.controller.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

router.get("/", getAllTasks)
router.get("/:taskId", getTaskById)
router.post("/", verifyToken, createTask)
router.put("/:taskId", verifyToken, updateTask)
router.delete("/:taskId", verifyToken, deleteTask)

export default router