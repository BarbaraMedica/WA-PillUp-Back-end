const express = require("express");
const router = express.Router();
const { generirajPDF, dohvatiUžeteLijekove, dohvatiBilješke } = require("../controllers/IzvjestajController");
const auth = require("../middleware/auth");

router.get("/pdf", auth, generirajPDF);
router.get("/uzeti-lijekovi", auth, dohvatiUžeteLijekove);
router.get("/biljezke", auth, dohvatiBilješke);

module.exports = router;