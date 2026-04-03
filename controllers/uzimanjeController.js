import UzimanjeLijeka from "../models/UzimanjeLijeka.js";
import Lijek from "../models/Lijek.js";

// pomoćna funkcija 
const vrijemeUMinute = (vrijemeString) => {
  if (!vrijemeString) return 0;
  const [sati, minute] = vrijemeString.split(":").map(Number);
  return sati * 60 + minute;
};

const odrediStatus = (planiranoHHMM, stvarnoDate) => {
  const [sati, minute] = planiranoHHMM.split(":").map(Number);

  const planirano = new Date(stvarnoDate);
  planirano.setHours(sati, minute, 0, 0);

  const diffMinutes = (stvarnoDate - planirano) / 60000;

  if (diffMinutes >= -5 && diffMinutes <= 30) return "na_vrijeme";
  if (diffMinutes > 30 && diffMinutes <= 120) return "kasno";
  return "preskoceno";
};

export const potvrdiUzimanje = async (req, res) => {
  try {
    const lijekId = req.params.id;
    const { vrijeme } = req.body; 

    const sada = new Date(); 
    const status = odrediStatus(vrijeme, sada);

    // Kreiramo zapis u bazi
    const zapis = await UzimanjeLijeka.create({
      korisnik: req.user.id,
      lijek: lijekId,
      datum: new Date(),
      vrijeme,
      vrijemeUzimanja: sada,
      status
    });

    const lijek = await Lijek.findById(lijekId);
    if (lijek && lijek.preostalo > 0) {
      lijek.preostalo -= 1;
      await lijek.save();
    }

    res.status(201).json({
      ...zapis.toObject(),
      poruka: `Lijek je ${status === "na_vrijeme" ? "uzet na vrijeme " : status === "kasno" ? "uzet kasno ⏰" : "preskočen ❌"}`
    });
  } catch (error) {
    console.error(" Greška pri spremanju uzimanja:", error);
    res.status(500).json({ message: "Greška pri spremanju uzimanja" });
  }
};



// Statistika uzimanja
export const uzimanjeStatistika = async (req, res) => {
  try {
    const sada = new Date();
    const uzimanja = await UzimanjeLijeka.find({
      korisnik: req.user.id,
      datum: { $lte: sada }
    });

    for (let u of uzimanja) {
      const [sati, minute] = u.vrijeme.split(":").map(Number);
      const planirano = new Date(u.datum);
      planirano.setHours(sati, minute, 0, 0);

      const diffMinutes = (sada - planirano) / 60000;

      if (!u.vrijemeUzimanja) {
        if (diffMinutes > 120) u.status = "preskoceno";
        else if (diffMinutes > 30) u.status = "kasno";
        else u.status = "na_vrijeme";

        await u.save();
      }
    }
    const total = uzimanja.length;

    const naVrijeme = uzimanja.filter(u => u.status === "na_vrijeme").length;
    const kasno = uzimanja.filter(u => u.status === "kasno").length;
    const preskoceno = uzimanja.filter(u => u.status === "preskoceno").length;

    res.json({
      naVrijeme: total ? Math.round((naVrijeme / total) * 100) : 0,
      kasno: total ? Math.round((kasno / total) * 100) : 0,
      preskoceno: total ? Math.round((preskoceno / total) * 100) : 0
    });
  } catch (err) {
    console.error("Greška:", err);
    res.status(500).json({ message: err.message });
  }
};

export const oznaciKaoUzet = async (req, res) => {
  try {
    const sada = new Date();
    const uzimanje = await UzimanjeLijeka.findById(req.params.id);
    if (!uzimanje) return res.status(404).json({ message: "Uzimanje nije pronađeno" });

    uzimanje.status = odrediStatus(uzimanje.vrijeme, sada);
    uzimanje.vrijemeUzimanja = sada;

    await uzimanje.save();
    res.json(uzimanje);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Greška pri označavanju lijeka" });
  }
};

export const azurirajStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { noviStatus } = req.body;

    if (!["na_vrijeme", "kasno", "preskoceno"].includes(noviStatus)) {
      return res.status(400).json({ message: "Nevaljani status" });
    }

    const zapis = await UzimanjeLijeka.findByIdAndUpdate(
      id,
      { status: noviStatus },
      { new: true }
    );

    res.json({
      ...zapis.toObject(),
      poruka: `Status je ažuriran na: ${noviStatus}`
    });
  } catch (error) {
    console.error("Greška pri ažuriranju statusa:", error);
    res.status(500).json({ message: "Greška pri ažuriranju statusa" });
  }
};

export const dohvatiDanasnjaUzimanja = async (req, res) => {
  try {
    const pocetakDana = new Date();
    pocetakDana.setHours(0, 0, 0, 0);

    const krajDana = new Date();
    krajDana.setHours(23, 59, 59, 999);

    const uzimanja = await UzimanjeLijeka.find({
      korisnik: req.user.id,
      datum: { $gte: pocetakDana, $lte: krajDana }
    });

    res.json(uzimanja);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju današnjih uzimanja" });
  }
};