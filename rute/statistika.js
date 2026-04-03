import express from "express";
import Raspolozenje from "../models/Raspolozenje.js";
import UzimanjeLijeka from "../models/UzimanjeLijeka.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/raspolozenje", auth, async (req, res) => {
  try {
    const raspolozenja = await Raspolozenje
      .find({ korisnik: req.user.id })
      .sort({ datum: 1 });

    const ukupno = raspolozenja.length;

    // Ako nema podataka → vrati prazno
    if (ukupno === 0) {
      return res.json({
        pozitivni: 0,
        neutralni: 0,
        negativni: 0,
        labels: [],
        stanje: []
      });
    }

    const pozitivniCount = raspolozenja.filter(r => r.stanje === "pozitivno").length;
    const neutralniCount = raspolozenja.filter(r => r.stanje === "neutralno").length;
    const negativniCount = raspolozenja.filter(r => r.stanje === "negativno").length;

    // Postotci
    const pozitivni = Math.round((pozitivniCount / ukupno) * 100);
    const neutralni = Math.round((neutralniCount / ukupno) * 100);
    const negativni = Math.round((negativniCount / ukupno) * 100);

    const labels = raspolozenja.map(r =>
      new Date(r.datum).toLocaleDateString("hr-HR")
    );

    const stanje = raspolozenja.map(r => {
      if (r.stanje === "pozitivno") return 3;
      if (r.stanje === "neutralno") return 2;
      return 1; // negativno
    });

    // Odgovor
    res.json({
      pozitivni,
      neutralni,
      negativni,
      labels,
      stanje
    });

  } catch (err) {
    console.error("Greška statistike raspoloženja:", err);
    res.status(500).json({ error: err.message });
  }
});

//uzimanje lijeka - zadnjih 7 dana
router.get("/uzimanje", auth, async (req, res) => {
  try {
    const sedam_dana_unazad = new Date();
    sedam_dana_unazad.setDate(sedam_dana_unazad.getDate() - 7);

    const uzimanja = await UzimanjeLijeka.find({ 
      korisnik: req.user.id,
      datum: { $gte: sedam_dana_unazad }
    });
    const total = uzimanja.length;

    if (!total) {
      return res.json({ naVrijeme: 0, kasno: 0, preskoceno: 0 });
    }

    const sada = new Date();

    // Provjeri i ažuriraj statuse za stavke koje nisu imale status
    for (let u of uzimanja) {
      if (!u.status) {
        const [sati, minute] = u.vrijeme.split(":").map(Number);
        const planirano = new Date(u.datum);
        planirano.setHours(sati, minute, 0, 0);

        const diffMinutes = (sada - planirano) / 60000;

        if (diffMinutes > 120) u.status = "preskoceno";
        else if (diffMinutes > 30) u.status = "kasno";
        else u.status = "na_vrijeme";

        await u.save();
      }
    }

    const naVrijeme = uzimanja.filter(u => u.status === "na_vrijeme").length;
    const kasno = uzimanja.filter(u => u.status === "kasno").length;
    const preskoceno = uzimanja.filter(u => u.status === "preskoceno").length;

    res.json({
      naVrijeme: Math.round((naVrijeme / total) * 100),
      kasno: Math.round((kasno / total) * 100),
      preskoceno: Math.round((preskoceno / total) * 100),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;