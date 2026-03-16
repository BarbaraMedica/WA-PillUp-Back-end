import express from "express";
import auth from "../middleware/auth.js";
import {
  createTerapija,
  getMojeTerapije,
  deleteTerapija
} from "../controllers/TerapijaController.js";

const router = express.Router();

router.post("/", auth, createTerapija);
router.get("/", auth, getMojeTerapije);
router.delete("/:id", auth, deleteTerapija);

export default router;
