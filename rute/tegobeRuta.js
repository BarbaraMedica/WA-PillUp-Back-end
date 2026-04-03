import express from "express";
const router = express.Router();
import Tegoba from "../models/Tegoba.js";
import auth from "../middleware/auth.js";

router.get("/", auth, async (req, res) => {
  try {
    const tegobe = await Tegoba
      .find({ korisnik: req.user.id })
      .sort({ datum: -1 });

    res.json(tegobe);
  } catch (err) {
    res.status(500).json({ error: "Greška na serveru" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { tegoba } = req.body;

    const novaTegoba = new Tegoba({
      tegoba,
      korisnik: req.user.id
    });

    const spremljeno = await novaTegoba.save();
    res.status(201).json(spremljeno);
  } catch (err) {
    res.status(400).json({ error: "Greška pri spremanju tegobe" });
  }
});

export default router;