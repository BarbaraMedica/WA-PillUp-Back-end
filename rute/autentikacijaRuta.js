const express = require("express");
const router = express.Router();
const Korisnik = require("../models/Korisnik");
const jwt = require("jsonwebtoken");

// REGISTRACIJA
router.post("/registracija", async (req, res) => {
  try {
    console.log("Registracija zahtjev:", req.body);
    const { email, lozinka } = req.body;

    const postoji = await Korisnik.findOne({ email });
    if (postoji) {
      return res.status(400).json({ msg: "Korisnik već postoji" });
    }

    const korisnik = new Korisnik({ email, lozinka });
    await korisnik.save();

    res.status(201).json({ msg: "Registracija uspješna" });
  } catch (err) {
    console.error("Registracija greška:", err.message, err.stack);
    res.status(500).json({ msg: "Greška na serveru", error: err.message });
  }
});

// PRIJAVA
router.post("/prijava", async (req, res) => {
  try {
    const { email, lozinka } = req.body;

    const korisnik = await Korisnik.findOne({ email });
    if (!korisnik) {
      return res.status(400).json({ msg: "Neispravni podaci" });
    }

    const isValid = await korisnik.provjeriLozinku(lozinka);
    if (!isValid) {
      return res.status(400).json({ msg: "Neispravni podaci" });
    }

    const token = jwt.sign(
      { id: korisnik._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Greška na serveru" });
  }
});

module.exports = router;
