const express = require("express");
const router = express.Router();
const Lijek = require("../models/Lijek");
const auth = require("../middleware/auth");

// DOHVATI SAMO SVOJE LIJEKOVE
router.get("/", auth, async (req, res) => {
  const lijekovi = await Lijek.find({ korisnik: req.user.id });
  res.json(lijekovi);
});

// DODAJ LIJEK
router.post("/", auth, async (req, res) => {
  const lijek = new Lijek({
    ...req.body,
    korisnik: req.user.id
  });

  await lijek.save();
  res.status(201).json(lijek);
});

module.exports = router;
