const Korisnik = require("../models/Korisnik");

exports.dohvatiKorisnika = async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.user.id).select("-lozinka");
    if (!korisnik) return res.status(404).json({ message: "Korisnik nije pronađen" });
    res.json(korisnik);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju korisnika" });
  }
};

exports.postaviIme = async (req, res) => {
  try {
    const { ime } = req.body;
    const korisnik = await Korisnik.findByIdAndUpdate(
      req.user.id,
      { ime },
      { new: true }
    ).select("-lozinka");
    if (!korisnik) return res.status(404).json({ message: "Korisnik nije pronađen" });
    res.json(korisnik);
  } catch (error) {
    res.status(500).json({ message: "Greška pri postavljanju imena" });
  }
};

exports.dohvatiPostavke = async (req, res) => {
  try {
    const korisnik = await Korisnik.findById(req.user.id).select("postavke");
    if (!korisnik) return res.status(404).json({ message: "Korisnik nije pronađen" });
    res.json(korisnik.postavke);
  } catch (error) {
    res.status(500).json({ message: "Greška pri dohvaćanju postavki" });
  }
};

exports.azurirajPostavke = async (req, res) => {
  try {
    const postavke = req.body;
    const korisnik = await Korisnik.findByIdAndUpdate(
      req.user.id,
      { postavke },
      { new: true }
    ).select("postavke");
    if (!korisnik) return res.status(404).json({ message: "Korisnik nije pronađen" });
    res.json(korisnik.postavke);
  } catch (error) {
    res.status(500).json({ message: "Greška pri ažuriranju postavki" });
  }
};