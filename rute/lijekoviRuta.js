const express = require("express");
const router = express.Router();
const {
  dohvatiLijekove,
  dodajLijek,
  azurirajLijek,
  obrisiLijek
} = require("../controllers/LijekoviController"); // controller

const auth = require("../middleware/auth"); // JWT autentikacija


// DOHVATI SVE LIJEKOVE KORISNIKA
router.get("/", auth, dohvatiLijekove);

// DODAJ NOVI LIJEK
router.post("/", auth, dodajLijek);

// AŽURIRAJ LIJEK
router.put("/:id", auth, azurirajLijek);

// OBRIŠI LIJEK
router.delete("/:id", auth, obrisiLijek);

module.exports = router;
