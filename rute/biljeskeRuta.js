import express from "express";
import Biljeska from "../models/Biljeska.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET - dohvati sve bilješke korisnika
router.get("/", auth, async (req, res) => {
  try {
    const biljeske = await Biljeska.find({ korisnik: req.user.id})
      .populate("lijek_id", "naziv doza")
      .sort({ createdAt: -1 });
    res.json(biljeske);
  } catch (err) {
    res.status(500).json({ msg: "Greška pri dohvaćanju bilješki" });
  }
});

// POST - spremi novu bilješku
router.post("/", auth, async (req, res) => {
  try {
    const { lijek_id, vrsta, tekst } = req.body;
    const biljeska = await Biljeska.create({
      korisnik: req.user.id,
      lijek_id,
      vrsta,
      tekst
    });
    res.status(201).json(biljeska);
  } catch (err) {
    res.status(500).json({ msg: "Greška pri spremanju bilješke" });
  }
});

// DELETE - obriši bilješku
router.delete("/:id", auth, async (req, res) => {
  try {
    const biljeska = await Biljeska.findOne({ 
      _id: req.params.id, 
      korisnik: req.user.id 
    });
    if (!biljeska) return res.status(404).json({ msg: "Bilješka nije pronađena" });
    
    await biljeska.deleteOne();
    res.json({ msg: "Bilješka obrisana" });
  } catch (err) {
    res.status(500).json({ msg: "Greška pri brisanju bilješke" });
  }
});

export default router;