const express = require("express");
const router = express.Router();
const Korisnik = require("../models/Korisnik");
const auth = require("../middleware/auth");

router.get("/profil", auth, async (req, res) => {
  const korisnik = await Korisnik.findById(req.user.id).select("-lozinka");
  res.json(korisnik);
});

module.exports = router;
