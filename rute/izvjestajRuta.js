import express from "express";
import auth from "../middleware/auth.js";
import { generirajPDF, dohvatiUzeteLijekove, dohvatiBiljeske } from "../controllers/IzvjestajController.js";

const router = express.Router();


router.get("/pdf", auth, generirajPDF);
router.get("/uzeti-lijekovi", auth, dohvatiUzeteLijekove);
router.get("/biljeske", auth, dohvatiBiljeske);

export default router;