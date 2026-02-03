const Lijek = require("../models/Lijek");

// Dohvati sve lijekove za korisnika
exports.dohvatiLijekove = async (req, res) => {
  try {
    const korisnikId = req.user.id;
    const lijekovi = await Lijek.find({ korisnik: korisnikId });
    res.json(lijekovi);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju lijekova" });
  }
};

// Dodaj novi lijek
exports.dodajLijek = async (req, res) => {
  try {
    const { ime, doza, vrijeme, nacin, kolicina, trajanje, podsjetnik } = req.body;
    const noviLijek = await Lijek.create({
      korisnik: req.user.id,
      ime,
      doza,
      vrijeme,
      nacin,
      kolicina: Number(kolicina),
      trajanje: Number(trajanje),
      preostalo: Number(kolicina),
      podsjetnik: Boolean(podsjetnik)
    });
    res.status(201).json(noviLijek);
  } catch (error) {
    console.error("Greška pri dodavanju lijeka:", error);
    res.status(500).json({ message: "Greška pri dodavanju lijeka" });
  }
};

// Ažuriraj lijek
exports.azurirajLijek = async (req, res) => {
  try {
    const lijek = await Lijek.findById(req.params.id);
    if (!lijek) return res.status(404).json({ message: "Lijek nije pronađen" });

    Object.assign(lijek, req.body);
    const azuriranLijek = await lijek.save();
    res.json(azuriranLijek);
  } catch (error) {
    res.status(500).json({ message: "Greška pri ažuriranju lijeka" });
  }
};

// Obriši lijek
exports.obrisiLijek = async (req, res) => {
  try {
    const lijek = await Lijek.findById(req.params.id);
    if (!lijek) return res.status(404).json({ message: "Lijek nije pronađen" });

    await lijek.remove();
    res.json({ message: "Lijek obrisan" });
  } catch (error) {
    res.status(500).json({ message: "Greška pri brisanju lijeka" });
  }
};

// Dohvati lijekove sa podsjetnicima
exports.dohvatiLijekoveSaPodsjetnicima = async (req, res) => {
  try {
    const korisnikId = req.user.id;
    const lijekovi = await Lijek.find({ korisnik: korisnikId, podsjetnik: true });
    res.json(lijekovi);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju lijekova sa podsjetnicima" });
  }
};

// Toggle podsjetnik za lijek
exports.togglePodsjetnik = async (req, res) => {
  try {
    const lijek = await Lijek.findById(req.params.id);
    if (!lijek) return res.status(404).json({ message: "Lijek nije pronađen" });

    lijek.podsjetnik = !lijek.podsjetnik;
    const azuriranLijek = await lijek.save();
    res.json(azuriranLijek);
  } catch (error) {
    res.status(500).json({ message: "Greška pri toggle-u podsjetnika" });
  }
};
