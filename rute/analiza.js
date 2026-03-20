import express from "express";
import UzimanjeLijeka from "../models/UzimanjeLijeka.js";
import Raspolozenje from "../models/raspolozenje.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = "user_1";

    const uzimanja = await UzimanjeLijeka.find({ korisnik: userId });
    const raspolozenja = await Raspolozenje.find({ userId });

    if (!uzimanja.length) {
      return res.json({
        adherence: 0,
        late: 0,
        missed: 0,
        message: "Nema dovoljno podataka za analizu."
      });
    }

    const total = uzimanja.length;

    const taken = uzimanja.filter(u => u.status === "uzeto").length;
    const missed = total - taken;

    const adherence = Math.round((taken / total) * 100);
    const missedPercent = Math.round((missed / total) * 100);
    //raspolozenje prosjek
    let avgRaspolozenje = 0;
    if (raspolozenja.length) {
      const sumRaspolozenje = raspolozenja.reduce((sum, r) => sum + r.nivo, 0);
      avgRaspolozenje = Math.round(sumRaspolozenje / raspolozenja.length);
    }
    //logika poruke
    let message = "";

    if (missed > 2) {
      message = "Primijećeno je često preskakanje terapije. Pokušajte biti redovitiji.";
    } else if (adherence > 80) {
      message = "Odlično se pridržavate terapije. Samo tako nastavite!";
    } else {
      message = "Pridržavanje terapije je umjereno. Možete još poboljšati rutinu.";
    }

    res.json({
      adherence,
      late: 0,
      missed: missedPercent,
      message
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška na serveru" });
  }
});

export default router;