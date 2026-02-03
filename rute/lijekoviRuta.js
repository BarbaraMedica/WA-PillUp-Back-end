const express = require("express");
const router = express.Router();
const {
  dohvatiLijekove,
  dodajLijek,
  azurirajLijek,
  obrisiLijek,
  dohvatiLijekoveSaPodsjetnicima,
  togglePodsjetnik
} = require("../controllers/LijekoviController"); // controller

const auth = require("../middleware/auth"); // JWT autentikacija
const role = require("../middleware/roleMiddleware");


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

module.exports = router;
