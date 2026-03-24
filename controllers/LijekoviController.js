import Lijek from "../models/Lijek.js";

// Dohvati sve lijekove za korisnika
export const dohvatiLijekove = async (req, res) => {
  try {
    const korisnikId = req.user.id;
    const lijekovi = await Lijek.find({ korisnik: korisnikId });
    res.json(lijekovi);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju lijekova" });
  }
};

// Dodaj novi lijek
export const dodajLijek = async (req, res) => {
  try {
    const { ime, doza, vrijeme, nacin, kolicina, trajanje, ucestalost, podsjetnik } = req.body;
    const noviLijek = await Lijek.create({
      korisnik: req.user.id,
      ime,
      doza,
      vrijeme,
      nacin,
      kolicina: Number(kolicina),
      trajanje: Number(trajanje),
      preostalo: Number(kolicina),
      ucestalost: Number(ucestalost) || 1,
      podsjetnik: Boolean(podsjetnik)
    });
    res.status(201).json(noviLijek);
  } catch (error) {
    console.error("Greška pri dodavanju lijeka:", error);
    res.status(500).json({ message: "Greška pri dodavanju lijeka" });
  }
};

export const dohvatiLijekPoId = async (req, res) => {
  try {
    const lijek = await Lijek.findById(req.params.id);
    if (!lijek) return res.status(404).json({ message: "Lijek nije pronađen" });
    res.json(lijek);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju lijeka" });
  }
};
// Azuriraj lijek
export const azurirajLijek = async (req, res) => {
  try {
    const lijek = await Lijek.findById(req.params.id);
    if (!lijek) return res.status(404).json({ message: "Lijek nije pronađen" });
    const { ime, doza, vrijeme, nacin, kolicina, trajanje, ucestalost, podsjetnik } = req.body;
    Object.assign(lijek, { ime, doza, vrijeme, nacin, kolicina: Number(kolicina), trajanje: Number(trajanje), ucestalost: Number(ucestalost) || 1, podsjetnik: Boolean(podsjetnik) });
    const azuriranLijek = await lijek.save();
    res.json(azuriranLijek);
  } catch (error) {
    res.status(500).json({ message: "Greška pri ažuriranju lijeka" });
  }
};


// Obriši lijek
export const obrisiLijek = async (req, res) => {
  try {
    const lijek = await Lijek.findById(req.params.id);
    if (!lijek) return res.status(404).json({ message: "Lijek nije pronađen" });
    // provjera vlasništva
    if (lijek.korisnik.toString() !== req.user.id) {
      return res.status(403).json({ message: "Ne možete obrisati tuđi lijek" });
    }
    await lijek.deleteOne();
    res.json({ message: "Lijek obrisan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri brisanju lijeka" });
  }
};

// Dohvati lijekove sa podsjetnicima
export const dohvatiLijekoveSaPodsjetnicima = async (req, res) => {
  try {
    const korisnikId = req.user.id;
    const lijekovi = await Lijek.find({ korisnik: korisnikId, podsjetnik: true });
    res.json(lijekovi);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju lijekova sa podsjetnicima" });
  }
};

// Toggle podsjetnik za lijek
export const togglePodsjetnik = async (req, res) => {
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
