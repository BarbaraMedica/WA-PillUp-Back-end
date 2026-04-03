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

import { 
  potvrdiUzimanje,
  oznaciKaoUzet,
  azurirajStatus,
  dohvatiDanasnjaUzimanja,
   uzimanjeStatistika
} from "../controllers/uzimanjeController.js"; 

import auth from "../middleware/auth.js";

const router = express.Router();

// DOHVATI SVE LIJEKOVE KORISNIKA
router.get("/", auth, dohvatiLijekove);

// DODAJ NOVI LIJEK
router.post("/", auth, dodajLijek);

// DOHVATI DANASNJA UZIMANJA
router.get("/danasnja-uzimanja", auth, dohvatiDanasnjaUzimanja);

// AŽURIRAJ LIJEK
router.put("/:id", auth, azurirajLijek);

// OBRIŠI LIJEK
router.delete("/:id", auth, obrisiLijek);

// DOHVATI LIJEKOVE SA PODSJETNICIMA
router.get("/sa-podsjetnicima", auth, dohvatiLijekoveSaPodsjetnicima);

// PO ID-U
router.get("/:id", auth, dohvatiLijekPoId);

// TOGGLE PODSJETNIK
router.patch("/:id/toggle-podsjetnik", auth, togglePodsjetnik);

// POTVRDI UZIMANJE LIJEKA (automatski određuje status)
router.post("/:id/uzimanje", auth, potvrdiUzimanje);

//  OZNAČI LIJEK KAO uzet
router.put("/:id/uzmi", auth, oznaciKaoUzet);

// AŽURIRAJ STATUS NAKON UZIMANJA (ako korisnik želi ručno promijeniti)
router.patch("/:id/status", auth, azurirajStatus);

export default router;