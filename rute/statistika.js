import express from "express";
import Raspolozenje from "../models/Raspolozenje.js"; // tvoja Mongoose shema

const router = express.Router();

// Endpoint za raspoloženje
router.get("/raspolozenje", async (req, res) => {
  try {
    const data = await Raspolozenje.find({ korisnikId: req.user.id }); // filtriraj po korisniku

    // Formatiraj podatke za grafove
    const labels = data.map(d => d.datum.toLocaleDateString());
    const stanje = data.map(d => d.stanje); // npr. 0-100
    const pozitivni = data.filter(d => d.tip === "pozitivno").length;
    const neutralni = data.filter(d => d.tip === "neutralno").length;
    const negativni = data.filter(d => d.tip === "negativno").length;

    res.json({ labels, stanje, pozitivni, neutralni, negativni });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;