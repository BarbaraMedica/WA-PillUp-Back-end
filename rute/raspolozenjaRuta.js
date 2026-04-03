import express from "express";
const router = express.Router();
import Raspolozenje from "../models/Raspolozenje.js";
import auth from "../middleware/auth.js";
// GET – samo raspoloženja prijavljenog korisnika
router.get("/", auth, async (req, res) => {
  try {
    const raspolozenja = await Raspolozenje
      .find({ korisnik: req.user.id })
      .sort({ datum: -1 });

    res.json(raspolozenja);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška na serveru" });
  }
});

// POST – dodaj raspoloženje prijavljenom korisniku
router.post("/", auth, async (req, res) => {
  try {
    const { datum, raspolozenje, stanje, biljeske } = req.body;

    const novoRaspolozenje = new Raspolozenje({
      datum,
      raspolozenje,
      stanje,
      biljeske,
      korisnik: req.user.id
    });

    const spremljeno = await novoRaspolozenje.save();
    res.status(201).json(spremljeno);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Greška prilikom dodavanja raspoloženja" });
  }
});

export default router;
