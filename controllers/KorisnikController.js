//moram tu povezati rutu autentifikacija sa controllerom
const express = require('express');
const router = express.Router();
const { dohvatiKorisnika } = require('../controllers/KorisnikController');
const auth = require('../middleware/auth');
//dohvati podatke o korisniku
router.get('/', auth, dohvatiKorisnika);
module.exports = router;
