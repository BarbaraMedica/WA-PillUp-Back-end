const express = require("express");
const router = express.Router();
const { dohvatiKorisnika, postaviIme, dohvatiPostavke, azurirajPostavke } = require("../controllers/KorisnikController");
const auth = require("../middleware/auth");

router.get("/profil", auth, dohvatiKorisnika);
router.post("/postavi-ime", auth, postaviIme);
router.get("/postavke", auth, dohvatiPostavke);
router.post("/postavke", auth, azurirajPostavke);

module.exports = router;
