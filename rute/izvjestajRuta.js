import express from "express";
import auth from "../middleware/auth.js";
import { generirajPDF, dohvatiUžeteLijekove, dohvatiBilješke } from "../controllers/IzvjestajController.js";

const router = express.Router();


router.get("/pdf", auth, generirajPDF);
router.get("/uzeti-lijekovi", auth, dohvatiUžeteLijekove);
router.get("/biljezke", auth, dohvatiBilješke);

export default router;