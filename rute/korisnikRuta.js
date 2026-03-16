import express from "express";
import { dohvatiKorisnika, postaviIme, dohvatiPostavke, azurirajPostavke } from "../controllers/KorisnikController.js";
import auth from "../middleware/auth.js";
const router = express.Router();

router.get("/profil", auth, dohvatiKorisnika);
router.post("/postavi-ime", auth, postaviIme);
router.get("/postavke", auth, dohvatiPostavke);
router.post("/postavke", auth, azurirajPostavke);

export default router;