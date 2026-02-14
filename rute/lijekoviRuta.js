import express from "express";

const router = express.Router();
import {
  dohvatiLijekove,
  dodajLijek,
  azurirajLijek,
  obrisiLijek,
  dohvatiLijekoveSaPodsjetnicima,
  togglePodsjetnik
} from "../controllers/LijekoviController.js"; 

import auth from "../middleware/auth.js";
import role from "../middleware/roleMiddleware.js";

// DOHVATI SVE LIJEKOVE KORISNIKA
router.get("/", auth, dohvatiLijekove);

// DODAJ NOVI LIJEK
router.post("/", auth, dodajLijek);

// AŽURIRAJ LIJEK
router.put("/:id", auth, azurirajLijek);

// OBRIŠI LIJEK
router.delete("/:id", auth, role("admin"), obrisiLijek);

// DOHVATI LIJEKOVE SA PODSJETNICIMA
router.get("/sa-podsjetnicima", auth, dohvatiLijekoveSaPodsjetnicima);

// TOGGLE PODSJETNIK
router.patch("/:id/toggle-podsjetnik", auth, togglePodsjetnik);

export default router;
