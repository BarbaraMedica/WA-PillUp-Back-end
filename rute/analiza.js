import express from "express";
import auth from "../middleware/auth.js";
import UzimanjeLijeka from "../models/UzimanjeLijeka.js";
import Raspolozenje from "../models/Raspolozenje.js";
import Lijek from "../models/Lijek.js";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const router = express.Router();

// GET /api/analiza - STATISTIKA
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sedam_dana_unazad = new Date();
    sedam_dana_unazad.setDate(sedam_dana_unazad.getDate() - 7);

    // 1. Dohvati sve definicije lijekova
    const mojiLijekovi = await Lijek.find({ korisnik: userId });
    const brojLijekovaPoDanu = mojiLijekovi.length;
    
    const ukupnoTrebaloBiti = brojLijekovaPoDanu * 7;

    // 2. Dohvati stvarno zabilježena uzimanja iz baze
    const uzimanja = await UzimanjeLijeka.find({ 
      korisnik: userId,
      datum: { $gte: sedam_dana_unazad } 
    });

    const raspolozenja = await Raspolozenje.find({ korisnik: userId });
    if (ukupnoTrebaloBiti === 0) {
      return res.json({ naVrijeme: 0, kasno: 0, preskoceno: 0, avgMood: 50 });
    }

    // 3. BROJANJE STATUSA
    const naVrijeme = uzimanja.filter(u => u.status === "na_vrijeme").length;
    const kasno = uzimanja.filter(u => u.status === "kasno").length;

    const zabiljezeno = naVrijeme + kasno;
    const preskoceno = Math.max(0, ukupnoTrebaloBiti - zabiljezeno);

    const naVrijemePercent = Math.round((naVrijeme / ukupnoTrebaloBiti) * 100);
    const kasnoPercent = Math.round((kasno / ukupnoTrebaloBiti) * 100);
    const preskocenePercent = Math.round((preskoceno / ukupnoTrebaloBiti) * 100);

    let avgMood = 50;
    if (raspolozenja.length) {
      const values = raspolozenja.map(r => {
        if (r.stanje === "pozitivno") return 2;
        if (r.stanje === "neutralno") return 1;
        return 0;
      });
      avgMood = Math.round((values.reduce((a, b) => a + b, 0) / raspolozenja.length) * 50);
    }

    res.json({ 
      naVrijeme: naVrijemePercent, 
      kasno: kasnoPercent, 
      preskoceno: preskocenePercent, 
      avgMood 
    });

  } catch (err) {
    console.error("Greška u analizi:", err);
    res.status(500).json({ error: "Greška na serveru" });
  }
});

// GET /api/statistika/uzimanje - DETALJNIJA STATISTIKA (zadnjih 7 dana)
router.get("/uzimanje", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const sedam_dana_unazad = new Date();
    sedam_dana_unazad.setDate(sedam_dana_unazad.getDate() - 7);

    const uzimanja = await UzimanjeLijeka.find({
      korisnik: userId,
      datum: { $gte: sedam_dana_unazad }
    });


    if (!uzimanja.length) {
      return res.json({ 
        naVrijeme: 0, 
        kasno: 0, 
        preskoceno: 0 
      });
    }
     const sada = new Date();

      //preskoci lijekove kojima je prošlo 2h, a korisnik ih nije označio
      for (let u of uzimanja) {
        const [sati, minute] = u.vrijeme.split(":").map(Number);
        const planirano = new Date(u.datum);
        planirano.setHours(sati, minute, 0, 0);

        const diffMinutes = (sada - planirano) / 60000;

        if (!u.status) {
          // Ako korisnik nije ništa označio
          if (diffMinutes > 120) u.status = "preskoceno";
          else if (diffMinutes > 30) u.status = "kasno";
          else u.status = "na_vrijeme";
          await u.save();
        } 
      }

      // Brojanje za zadnjih 7 dana
      const total = uzimanja.length;
      const naVrijeme = uzimanja.filter(u => u.status === "na_vrijeme").length;
      const kasno = uzimanja.filter(u => u.status === "kasno").length;
      const preskoceno = uzimanja.filter(u => u.status === "preskoceno").length;

      const naVrijemePercent = Math.round((naVrijeme / total) * 100);
      const kasnoPercent = Math.round((kasno / total) * 100);
      const preskocenePercent = Math.round((preskoceno / total) * 100);

      res.json({
        naVrijeme: naVrijemePercent,
        kasno: kasnoPercent,
        preskoceno: preskocenePercent
      })} catch (err) {
        console.error("Greška:", err);
        res.status(500).json({ error: "Greška na serveru" });
      }
    });

// POST /api/analiza/analyze — AI analiza (Groq)
router.post("/analyze", auth, async (req, res) => {
  try {
    const { adherence, avgMood, missed } = req.body;

    if (adherence === undefined || avgMood === undefined || missed === undefined) {
      return res.status(400).json({ error: "Nedostaju podaci" });
    }

    const prompt = `Korisnik medicinske aplikacije za praćenje lijekova ima ove podatke:
- Pridržavanje terapije (na vrijeme): ${adherence}%
- Prosječno raspoloženje (0=loše, 100=odlično): ${avgMood}
- Preskočene doze: ${missed}%

Daj odgovor kao JSON objekt ali uređen i lagan za shvaćanje korisnicima (bez ikakvih oznaka, kao markdown, ne samo JSON):
{
  "interpretation": "kratka interpretacija na hrvatskom (1-2 rečenice)",
  "advice": "konkretan savjet na hrvatskom (1-2 rečenice)",
  "actions": ["akcija 1", "akcija 2", "akcija 3"]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "Ti si zdravstveni asistent koji daje kratke, korisne savjete na hrvatskom jeziku." },
        { role: "user", content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.7
    });

    const aiOutput = completion.choices[0].message.content.trim();

    let parsed;
    try {
      const cleaned = aiOutput.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { interpretation: aiOutput, advice: "", actions: [] };
    }

    res.json(parsed);
  } catch (error) {
    console.error("Groq greška:", error);
    res.status(500).json({ error: "Greška u AI analizi" });
  }
});

export default router;