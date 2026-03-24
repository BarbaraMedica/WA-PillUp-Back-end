import UzimanjeLijeka from "../models/UzimanjeLijeka.js";
import Lijek from "../models/Lijek.js";

export const potvrdiUzimanje = async (req, res) => {
  try {
    const lijekId = req.params.id; // ID dolazi iz URL-a
    const { vrijeme } = req.body;

    // Dodaj zapis o uzimanju
    const zapis = await UzimanjeLijeka.create({
      korisnik: req.user.id,
      lijek: lijekId,
      datum: new Date(),
      vrijeme,
      status: "uzet"
    });

    // Smanji preostalo tableta za 1 (ili više ako je učestalost)
    const lijek = await Lijek.findById(lijekId);
    if (lijek && lijek.preostalo > 0) {
      lijek.preostalo -= 1; // Pretpostavimo 1 doza po uzimanju
      await lijek.save();
    }

    res.status(201).json(zapis);
  } catch (error) {
    console.error("Greška pri spremanju uzimanja:", error);
    res.status(500).json({ message: "Greška pri spremanju uzimanja" });
  }
};

export const uzimanjeStatistika = async (req, res) => {
  try {
    const uzimanja = await UzimanjeLijeka.find({ korisnik: req.user.id });
    const total = uzimanja.length;

    if (!total) return res.json({ naVrijeme: 0, kasno: 0, preskoceno: 0 });

    const naVrijeme = uzimanja.filter(u => u.status === "uzet").length;
    const preskoceno = uzimanja.filter(u => u.status === "preskocen").length;

    res.json({
      naVrijeme: Math.round((naVrijeme / total) * 100),
      kasno: 0,
      preskoceno: Math.round((preskoceno / total) * 100),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
