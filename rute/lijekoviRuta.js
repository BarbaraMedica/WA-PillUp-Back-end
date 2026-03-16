import express from "express";
import {
  dohvatiLijekove,
  dohvatiLijekPoId,
  azurirajLijek,
  dodajLijek,
  obrisiLijek,
  dohvatiLijekoveSaPodsjetnicima,
  togglePodsjetnik
} from "../controllers/LijekoviController.js";

import { potvrdiUzimanje } from "../controllers/uzimanjeController.js"; 

import auth from "../middleware/auth.js";
import role from "../middleware/roleMiddleware.js";

const router = express.Router();
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

//PO ID-U
router.get("/:id", auth, dohvatiLijekPoId);

// TOGGLE PODSJETNIK
router.patch("/:id/toggle-podsjetnik", auth, togglePodsjetnik);

// POTVRDI UZIMANJE LIJEKA
router.post("/:id/uzimanje", auth, potvrdiUzimanje);

export default router;
